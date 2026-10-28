import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 10;

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
}).strict();

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL_FIRST;
  const anonKey = process.env.SUPABASE_PUBLIC_KEY;
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY1;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return Response.json({ message: "DAAV isn't configured yet. Please try again later." }, { status: 503 });
  }

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.match(/^Bearer\\s+(.+)$/i)?.[1];
  if (!token) return Response.json({ message: "Please sign in before creating your DAAV." }, { status: 401 });

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) return Response.json({ message: "Your session expired. Please sign in again." }, { status: 401 });

  let rawBody: unknown;
  try { rawBody = await request.json(); }
  catch { return Response.json({ message: "Enter your company or product name." }, { status: 400 }); }

  const parsed = registrationSchema.safeParse(rawBody);
  if (!parsed.success) return Response.json({ message: "Enter a company or product name (2–100 characters)." }, { status: 400 });

  const slugBase = parsed.data.name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "product";
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: listing, error: insertError } = await adminClient.from("listings").insert({
    owner_id: userData.user.id,
    name: parsed.data.name,
    slug,
    website_url: null,
    description: null,
    category: null,
    entity_type: "independent_product",
    registration_identifier: null,
    verification_status: "approved",
    approved_at: new Date().toISOString(),
  }).select("id, name, slug, website_url, verification_status, approved_at").single();

  if (insertError || !listing) {
    if (insertError?.code === "23505") return Response.json({ message: "This company or product is already registered." }, { status: 409 });
    return Response.json({ message: "We couldn't create your DAAV just now. Please try again." }, { status: 500 });
  }

  return Response.json({ outcome: "success", message: "Your DAAV is ready.", listing });
}
