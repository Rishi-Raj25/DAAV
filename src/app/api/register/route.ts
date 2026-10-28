import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 10;

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  website: z.string().trim().min(3).max(300),
}).strict();

function normalizeWebsite(raw: string): string | null {
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw.trim() : `https://${raw.trim()}`);
    if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) return null;
    if (!url.hostname || !url.hostname.includes(".") || url.hostname.endsWith(".") || url.hostname.includes(" ")) return null;
    if (url.hostname === "localhost" || url.hostname.endsWith(".localhost") || url.hostname.endsWith(".local") || url.hostname.endsWith(".internal")) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL_FIRST;
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY1;
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ message: "DAAV isn't configured yet. Please try again later." }, { status: 503 });
  }

  let rawBody: unknown;
  try { rawBody = await request.json(); }
  catch { return Response.json({ message: "Enter your company name and website." }, { status: 400 }); }

  const parsed = registrationSchema.safeParse(rawBody);
  if (!parsed.success) return Response.json({ message: "Enter a company name (2–100 characters) and website URL." }, { status: 400 });

  const websiteUrl = normalizeWebsite(parsed.data.website);
  if (!websiteUrl) return Response.json({ message: "Enter a valid public HTTPS website URL." }, { status: 400 });

  const slugBase = parsed.data.name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "product";
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: listing, error: insertError } = await adminClient.from("listings").insert({
    owner_id: null,
    name: parsed.data.name,
    slug,
    website_url: websiteUrl,
    description: null,
    category: null,
    entity_type: "independent_product",
    registration_identifier: null,
    verification_status: "approved",
    approved_at: new Date().toISOString(),
  }).select("id, name, slug, website_url, verification_status, approved_at").single();

  if (insertError || !listing) {
    if (insertError?.code === "23505") return Response.json({ message: "This company or website may already be registered." }, { status: 409 });
    return Response.json({ message: "We couldn't create your DAAV just now. Please try again." }, { status: 500 });
  }

  return Response.json({ outcome: "success", message: "Your DAAV is ready.", listing });
}
