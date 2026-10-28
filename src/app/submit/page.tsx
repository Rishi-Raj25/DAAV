"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const categories = ["AI & Tech", "Indian SaaS", "D2C & Brands", "Developer Tools", "Design & Creator", "Other"];

export default function SubmitProductPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [entityType, setEntityType] = useState("independent_product");
  const [registrationIdentifier, setRegistrationIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError("Supabase is not connected yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables, then redeploy.");
      setReady(true);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data, error: authError }) => {
      if (authError || !data.user) router.replace("/login?next=/submit");
      else { setSignedIn(true); setReady(true); }
    }).catch(() => { setError("Could not check your sign-in session. Please refresh and try again."); setReady(true); });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) { router.replace("/login?next=/submit"); return; }
      const normalizedWebsite = new URL(website.startsWith("http") ? website : `https://${website}`).toString();
      const slugBase = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "product";
      const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;
      const { error: insertError } = await supabase.from("listings").insert({
        owner_id: user.id, name: name.trim(), slug, website_url: normalizedWebsite,
        description: description.trim(), category, entity_type: entityType,
        registration_identifier: registrationIdentifier.trim() || null,
        verification_status: "pending",
      });
      if (insertError) throw insertError;
      setSuccess(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not submit the listing. Please try again.");
    } finally { setLoading(false); }
  }

  if (!ready) return <main className="grid min-h-screen place-items-center"><LoaderCircle className="animate-spin text-[#c96e31]" size={26}/></main>;

  return <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto w-full max-w-[680px]">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-stone-950"><ArrowLeft size={16}/> Back to DAAV</Link>
      <div className="panel mt-8 p-5 sm:p-8">
        <p className="mini-label">Your product. Your move.</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] sm:text-4xl">{success ? "Submission received." : "Put your product on the map."}</h1>
        {success ? <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5"><ShieldCheck size={24} className="text-emerald-700"/><h2 className="mt-3 font-bold text-emerald-900">It’s in the review queue.</h2><p className="mt-2 text-sm leading-6 text-emerald-800">Your listing has been saved as pending. It won’t appear on the public leaderboard until the DAAV team reviews and approves it. Paid placement is not enabled yet.</p><Link href="/" className="secondary-button mt-5">Back to leaderboard <ArrowRight size={15} className="ml-2"/></Link></div> : <>
          <p className="mt-2 text-sm leading-6 text-stone-600">Tell us what you’re building. Submissions are reviewed before they can appear on the leaderboard.</p>
          {!signedIn && error && <p role="alert" className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900">{error}</p>}
          {signedIn && <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block text-sm font-semibold">Product or business name<input required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Neem AI" className="mt-2 min-h-11 w-full rounded-lg border border-[#ded5c8] bg-white px-3 text-sm outline-none focus:border-[#c96e31]"/></label>
            <label className="block text-sm font-semibold">Website URL<input required type="text" maxLength={300} value={website} onChange={e=>setWebsite(e.target.value)} placeholder="yourproduct.in" className="mt-2 min-h-11 w-full rounded-lg border border-[#ded5c8] bg-white px-3 text-sm outline-none focus:border-[#c96e31]"/></label>
            <label className="block text-sm font-semibold">What does it do?<span className="ml-2 font-normal text-stone-400">20–500 characters</span><textarea required minLength={20} maxLength={500} rows={4} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Explain the product in plain language…" className="mt-2 w-full resize-y rounded-lg border border-[#ded5c8] bg-white p-3 text-sm leading-6 outline-none focus:border-[#c96e31]"/></label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold">Category<select value={category} onChange={e=>setCategory(e.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-[#ded5c8] bg-white px-3 text-sm outline-none focus:border-[#c96e31]">{categories.map(item=><option key={item}>{item}</option>)}</select></label>
              <label className="block text-sm font-semibold">Business type<select value={entityType} onChange={e=>setEntityType(e.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-[#ded5c8] bg-white px-3 text-sm outline-none focus:border-[#c96e31]"><option value="independent_product">Independent product</option><option value="company">Registered company</option><option value="llp">LLP</option><option value="sole_proprietor">Sole proprietor</option><option value="other">Other</option></select></label>
            </div>
            <label className="block text-sm font-semibold">Registration ID <span className="font-normal text-stone-400">(optional, if applicable)</span><input maxLength={120} value={registrationIdentifier} onChange={e=>setRegistrationIdentifier(e.target.value)} placeholder="CIN / LLPIN / other reference" className="mt-2 min-h-11 w-full rounded-lg border border-[#ded5c8] bg-white px-3 text-sm outline-none focus:border-[#c96e31]"/></label>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700">{error}</p>}
            <div className="rounded-lg bg-[#f7f4ee] p-3 text-xs leading-5 text-stone-600"><ShieldCheck size={15} className="mr-1 inline text-emerald-700"/> Submitting does not mean approval. DAAV may request additional information. No payment is collected on this page.</div>
            <button disabled={loading} className="primary-button w-full disabled:cursor-wait disabled:opacity-60">{loading ? <LoaderCircle size={16} className="animate-spin"/> : null}{loading ? "Submitting…" : "Submit for review"}{!loading && <ArrowRight size={16}/>}</button>
          </form>}
        </>}
      </div>
    </div>
  </main>;
}
