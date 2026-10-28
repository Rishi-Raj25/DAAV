import { createClient } from "@supabase/supabase-js";
import { lookup } from "node:dns/promises";
import https from "node:https";
import { isIP } from "node:net";
import { URL } from "node:url";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 10;

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  website: z.string().trim().min(4).max(300),
  description: z.string().trim().min(20).max(500),
  sector: z.string().trim().min(2).max(80),
}).strict();

const MAX_HTML_BYTES = 900_000;
const REQUEST_TIMEOUT_MS = 6_000;
const MAX_REDIRECTS = 3;

type WebsiteResult =
  | { outcome: "pass"; url: string; title: string; reason: string }
  | { outcome: "reject"; reason: string }
  | { outcome: "review"; reason: string }
  | { outcome: "retry"; reason: string };

function isPublicIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b, c] = parts;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && (b === 0 || b === 168)) return false;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false;
  if (a === 198 && (b === 18 || b === 19 || b === 51)) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  if (a === 255) return false;
  return true;
}

function isPublicIPv6(ip: string): boolean {
  const value = ip.toLowerCase().split("%")[0];
  // Restrict to global unicast. Excludes loopback, link-local, unique-local,
  // multicast, IPv4-mapped addresses and documentation ranges.
  if (!value.startsWith("2") && !value.startsWith("3")) return false;
  if (value.startsWith("2001:db8:") || value.startsWith("2001:10:") || value.startsWith("2001:20:")) return false;
  if (value.includes(".")) return false;
  return isIP(value) === 6;
}

function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return isPublicIPv4(address);
  if (family === 6) return isPublicIPv6(address);
  return false;
}

async function resolvePublicHost(hostname: string): Promise<string> {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("This website address cannot be checked safely.");
  }
  if (isIP(host)) {
    if (!isPublicAddress(host)) throw new Error("Private or local IP addresses are not allowed.");
    // Disallow IP literals even if public: a business website should use a domain.
    throw new Error("Please enter a public website domain, not an IP address.");
  }
  const records = await lookup(host, { all: true, verbatim: true });
  if (!records.length || records.some(record => !isPublicAddress(record.address))) {
    throw new Error("The domain does not resolve exclusively to public internet addresses.");
  }
  const ipv4 = records.find(record => record.family === 4);
  if (!ipv4) throw new Error("This website's network address cannot be checked safely. Please try another domain.");
  return ipv4.address;
}

function requestPage(input: URL, pinnedIp: string): Promise<{ status: number; headers: https.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const request = https.request({
      protocol: "https:",
      hostname: input.hostname,
      port: 443,
      path: `${input.pathname}${input.search}`,
      method: "GET",
      headers: {
        "user-agent": "DAAV-WebsiteCheck/1.0 (+https://daav-gilt.vercel.app)",
        accept: "text/html,application/xhtml+xml,text/plain;q=0.8",
        "accept-encoding": "identity",
        connection: "close",
      },
      timeout: REQUEST_TIMEOUT_MS,
      // Pin the connection to the IP we just validated, while retaining the
      // original hostname for TLS certificate validation and the Host header.
      lookup: (_hostname, _options, callback) => callback(null, pinnedIp, 4),
    }, response => {
      const status = response.statusCode ?? 0;
      const contentType = String(response.headers["content-type"] ?? "").toLowerCase();
      if ([301, 302, 303, 307, 308].includes(status)) {
        response.resume();
        resolve({ status, headers: response.headers, body: "" });
        return;
      }
      if (!contentType.includes("text/html") && !contentType.includes("text/plain") && !contentType.includes("application/xhtml+xml")) {
        response.resume();
        resolve({ status, headers: response.headers, body: "" });
        return;
      }
      const chunks: Buffer[] = [];
      let size = 0;
      response.on("data", (chunk: Buffer | string) => {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += buffer.length;
        if (size > MAX_HTML_BYTES) {
          request.destroy(new Error("Website page is too large to check safely."));
          return;
        }
        chunks.push(buffer);
      });
      response.on("end", () => resolve({ status, headers: response.headers, body: Buffer.concat(chunks).toString("utf8") }));
      response.on("error", reject);
    });
    request.on("timeout", () => request.destroy(new Error("Website request timed out.")));
    request.on("error", reject);
    request.end();
  });
}

function decodePage(html: string) {
  const title = (html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1] ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
  const text = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<(br|\/p|\/div|\/h[1-6]|\/li|\/section|\/article)\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
  return { title, text };
}

async function checkWebsite(raw: string, submitted: { name: string; description: string; sector: string }): Promise<WebsiteResult> {
  let current: URL;
  try {
    current = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { outcome: "reject", reason: "Enter a valid public website URL." };
  }
  if (current.protocol !== "https:" || current.username || current.password || current.port && current.port !== "443") {
    return { outcome: "reject", reason: "Use a public HTTPS website on the standard port (443)." };
  }
  if (!current.hostname || current.hostname.includes(" ") || current.hostname.endsWith(".")) {
    return { outcome: "reject", reason: "Enter a valid public website domain." };
  }

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    if (current.protocol !== "https:" || current.username || current.password || (current.port && current.port !== "443")) {
      return { outcome: "reject", reason: "The website redirects to an unsupported or unsafe address." };
    }
    let pinnedIp: string;
    try {
      pinnedIp = await resolvePublicHost(current.hostname);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("timed out") || message.includes("ENOTFOUND") || message.includes("EAI_AGAIN") || message.includes("SERVFAIL")) {
        return { outcome: "retry", reason: "We couldn't reach the website right now. Please retry in a moment." };
      }
      return { outcome: "reject", reason: message || "The website address could not be checked safely." };
    }

    let response: Awaited<ReturnType<typeof requestPage>>;
    try {
      response = await requestPage(current, pinnedIp);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/timed out|timeout|ECONNRESET|ECONNREFUSED|EAI_AGAIN|ENOTFOUND|ETIMEDOUT|EHOSTUNREACH|ECONNABORTED/i.test(message)) {
        return { outcome: "retry", reason: "The website did not respond reliably. Please retry in a moment." };
      }
      return { outcome: "review", reason: "We couldn't safely read the website automatically. It needs another look." };
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.location;
      if (!location || redirects === MAX_REDIRECTS) return { outcome: "review", reason: "The website uses too many redirects to check automatically." };
      try { current = new URL(location, current); }
      catch { return { outcome: "review", reason: "The website's redirect could not be checked." }; }
      continue;
    }
    if (response.status === 429 || response.status >= 500) {
      return { outcome: "retry", reason: "The website is temporarily unavailable or rate-limiting checks. Please retry shortly." };
    }
    if (response.status < 200 || response.status >= 300) {
      return { outcome: "review", reason: "The website returned a restricted or unexpected response. It needs another look." };
    }

    const { title, text } = decodePage(response.body);
    const combined = `${title} ${text}`.toLowerCase();
    const rejectPatterns = [
      /domain (is )?(for sale|available to buy)/i,
      /buy this domain|this domain may be for sale|parked free|domain parking/i,
      /sedo domain parking|afternic|hugedomains|dan\.com/i,
      /coming soon|under construction|website coming soon/i,
      /lorem ipsum|example domain|this is a test page|test website/i,
      /welcome to nginx|apache2 ubuntu default page|it works!.*default/i,
      /your hosting account has been suspended|account has been suspended/i,
    ];
    if (rejectPatterns.some(pattern => pattern.test(combined))) {
      return { outcome: "reject", reason: "This page looks parked, unfinished, or like a placeholder rather than an active business website." };
    }
    if (!title || text.length < 260) {
      return { outcome: "review", reason: "The website doesn't provide enough readable information to confirm what the business does." };
    }
    const hasBusinessSignals = /about us|about (the )?(company|team|product)|our services|our products|contact us|pricing|features|customers|solutions|shop|services|product|platform|company|business|contact|privacy policy|terms of service/i.test(combined);
    const hasGenericHostSignals = /default web site page|domain has been registered|website is hosted by|index of \/|web server is working/i.test(combined);
    if (hasGenericHostSignals || !hasBusinessSignals) {
      return { outcome: "review", reason: "The page doesn't clearly establish an active product or business. It needs a quick review." };
    }

    // Compare the submitted details with visible website text. This is a
    // lightweight heuristic, not an AI/legal identity guarantee; ambiguous
    // matches go to review rather than being marked approved.
    const normalizedPage = combined.normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, " ");
    const domainStem = current.hostname.replace(/^www\\./i, "").split(".")[0].toLowerCase();
    const nameTokens = submitted.name.toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").split(/[^a-z0-9]+/).filter(token => token.length >= 3 && !["private", "limited", "company", "technologies", "technology", "solutions", "services", "official"].includes(token));
    const nameMatches = nameTokens.some(token => normalizedPage.includes(token) || domainStem.includes(token));
    const descriptionTokens = [...new Set(submitted.description.toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").split(/[^a-z0-9]+/).filter(token => token.length >= 5 && !["their", "there", "which", "where", "about", "built", "helps", "provides", "platform", "company", "business", "product", "service", "services", "using", "users", "simple", "based"].includes(token)))];
    const descriptionMatches = descriptionTokens.filter(token => normalizedPage.includes(token)).length;
    const sectorTokens = submitted.sector.toLowerCase().split(/[^a-z0-9]+/).filter(token => token.length >= 4 && !["other"].includes(token));
    const sectorMatches = sectorTokens.some(token => normalizedPage.includes(token));
    if (!nameMatches && !(descriptionMatches >= 2 && sectorMatches)) {
      return { outcome: "review", reason: "The website is reachable, but we couldn't confidently match it to the submitted business name and description." };
    }
    return { outcome: "pass", url: current.origin, title: title.slice(0, 180), reason: "The HTTPS website is reachable and its visible content matches the submitted business details." };
  }
  return { outcome: "review", reason: "The website could not be checked automatically." };
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return Response.json({ outcome: "configuration_error", message: "Registration checks are not configured yet. Please try again later." }, { status: 503 });
  }

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return Response.json({ outcome: "unauthorized", message: "Please sign in before registering." }, { status: 401 });

  const userClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) return Response.json({ outcome: "unauthorized", message: "Your session expired. Please sign in again." }, { status: 401 });

  let rawBody: unknown;
  try { rawBody = await request.json(); }
  catch { return Response.json({ outcome: "invalid", message: "Please check the form and try again." }, { status: 400 }); }
  const parsed = registrationSchema.safeParse(rawBody);
  if (!parsed.success) return Response.json({ outcome: "invalid", message: "Enter a name, website, description (20–500 characters), and sector." }, { status: 400 });

  const result = await checkWebsite(parsed.data.website, parsed.data);
  if (result.outcome !== "pass") {
    const status = result.outcome === "retry" ? 503 : result.outcome === "review" ? 422 : 400;
    return Response.json({ outcome: result.outcome, message: result.reason }, { status });
  }

  const slugBase = parsed.data.name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "product";
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: listing, error: insertError } = await adminClient.from("listings").insert({
    owner_id: userData.user.id,
    name: parsed.data.name,
    slug,
    website_url: result.url,
    description: parsed.data.description,
    category: parsed.data.sector,
    entity_type: "independent_product",
    registration_identifier: null,
    verification_status: "approved",
    approved_at: new Date().toISOString(),
  }).select("id, name, slug, website_url, verification_status, approved_at").single();

  if (insertError || !listing) {
    if (insertError?.code === "23505") return Response.json({ outcome: "review", message: "This product may already be registered. Please check your existing listings or contact support." }, { status: 409 });
    return Response.json({ outcome: "error", message: "The website passed its check, but we couldn't save the registration. Please retry." }, { status: 500 });
  }

  return Response.json({ outcome: "success", message: "Website check passed. Your product is registered and can now be considered for the leaderboard.", listing });
}
