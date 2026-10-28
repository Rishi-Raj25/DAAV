"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Globe, LoaderCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const sectors = ["AI & Technology", "SaaS", "E-commerce & D2C", "Finance & Fintech", "Education", "Healthcare", "Media & Creator Economy", "Other"];

type ResultState = { kind: "success" | "retry" | "review" | "error"; message: string };

export default function SubmitProductPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [sector, setSector] = useState(sectors[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError("Registration isn't configured yet. Please try again later.");
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
    event.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      const supabase = createClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        router.replace("/login?next=/submit");
        return;
      }
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ name, website, description, sector }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof payload.message === "string" ? payload.message : "We couldn't complete registration. Please try again.";
        if (payload.outcome === "retry") setResult({ kind: "retry", message });
        else if (payload.outcome === "review") setResult({ kind: "review", message });
        else setError(message);
        return;
      }
      setResult({ kind: "success", message: payload.message || "Your website passed the check and your registration is complete." });
    } catch {
      setResult({ kind: "retry", message: "We couldn't reach DAAV's registration service. Your details haven't been registered; please retry." });
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return <main className="grid min-h-screen place-items-center"><LoaderCircle className="animate-spin text-[#c96e31]" size={26}/></main>;

  return <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto w-full max-w-[680px]">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-stone-950"><ArrowLeft size={16}/> Back to DAAV</Link>
      <div className="panel mt-8 p-5 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="brand-mark">द</div>
          <div><p className="mini-label">DAAV Quick Registration</p><p className="mt-1 text-xs text-stone-500">Four fields. Usually under two minutes.</p></div>
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-[-0.06em] sm:text-4xl">{result?.kind === "success" ? "You're on the board." : "Put your product on the map."}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Tell us what you're building. DAAV checks the website you provide for signs of an active product or business before completing registration. No registration documents required.</p>

        {result?.kind === "success" ? <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <CheckCircle2 size={25} className="text-emerald-700"/>
          <h2 className="mt-3 font-bold text-emerald-900">Website check passed</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-800">{result.message}</p>
          <p className="mt-3 text-xs leading-5 text-emerald-800">This is an automated website screening, not a legal certification of company incorporation. Payment and paid ranking are separate and are not enabled here.</p>
          <Link href="/" className="secondary-button mt-5">Back to DAAV <ArrowRight size={15} className="ml-2"/></Link>
        </div> : <>
          {!signedIn && error && <p role="alert" className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900">{error}</p>}
          {signedIn && <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block text-sm font-semibold">Company or product name<input required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Neem AI" className="mt-2 min-h-11 w-full rounded-lg border border-[#ded5c8] bg-white px-3 text-sm outline-none focus:border-[#c96e31]"/></label>
            <label className="block text-sm font-semibold">Official website<input required type="text" maxLength={300} value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://yourcompany.in" autoCapitalize="none" autoCorrect="off" className="mt-2 min-h-11 w-full rounded-lg border border-[#ded5c8] bg-white px-3 text-sm outline-none focus:border-[#c96e31]"/><span className="mt-1 block text-xs font-normal text-stone-500">Use a public HTTPS website. We check it automatically before registration.</span></label>
            <label className="block text-sm font-semibold">What do you do?<span className="ml-2 font-normal text-stone-400">20–500 characters</span><textarea required minLength={20} maxLength={500} rows={3} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe your product or service in a couple of sentences…" className="mt-2 w-full resize-y rounded-lg border border-[#ded5c8] bg-white p-3 text-sm leading-6 outline-none focus:border-[#c96e31]"/><span className="mt-1 block text-right text-xs font-normal text-stone-400">{description.length}/500</span></label>
            <label className="block text-sm font-semibold">Sector<select value={sector} onChange={e=>setSector(e.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-[#ded5c8] bg-white px-3 text-sm outline-none focus:border-[#c96e31]">{sectors.map(item=><option key={item}>{item}</option>)}</select></label>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700">{error}</p>}
            {result && result.kind !== "success" && <div role="status" className={`rounded-lg border p-3 text-sm leading-5 ${result.kind === "retry" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-orange-200 bg-orange-50 text-orange-900"}`}><p className="font-bold">{result.kind === "retry" ? "Temporary website issue" : "We couldn't confirm the website automatically"}</p><p className="mt-1">{result.message}</p>{result.kind === "review" && <p className="mt-2 text-xs">Nothing has been registered yet. Check the URL or contact DAAV for a quick review.</p>}</div>}
            <div className="rounded-lg bg-[#f7f4ee] p-3 text-xs leading-5 text-stone-600"><Globe size={15} className="mr-1 inline text-[#c96e31]"/> We check the public website for reachable pages and real product/business information. Parked or obvious placeholder pages are rejected; outages can be retried. This is website screening, not legal company verification.</div>
            <button disabled={loading} className="primary-button w-full disabled:cursor-wait disabled:opacity-60">{loading ? <LoaderCircle size={16} className="animate-spin"/> : <ShieldCheck size={16}/>}{loading ? "Checking your website…" : "Check website & register"}{!loading && <ArrowRight size={16}/>}</button>
          </form>}
        </>}
      </div>
    </div>
  </main>;
}
