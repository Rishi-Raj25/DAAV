"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ResultState = { message: string; name: string };

export default function SubmitProductPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError("DAAV isn't configured yet. Please try again later.");
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
        body: JSON.stringify({ name }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof payload.message === "string" ? payload.message : "We couldn't create your DAAV. Please try again.");
        return;
      }
      setResult({ message: payload.message || "Your DAAV is ready.", name });
    } catch {
      setError("We couldn't reach DAAV right now. Your DAAV may not have been created; please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return <main className="grid min-h-screen place-items-center"><LoaderCircle className="animate-spin text-[#c96e31]" size={26}/></main>;

  return <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto w-full max-w-[600px]">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-stone-950"><ArrowLeft size={16}/> Back to DAAV</Link>
      <div className="panel mt-8 p-5 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="brand-mark">द</div>
          <div><p className="mini-label">Create your DAAV</p><p className="mt-1 text-xs text-stone-500">One name. You&apos;re in.</p></div>
        </div>
        {result ? <div className="mt-7">
          <CheckCircle2 size={30} className="text-emerald-700"/>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.06em] sm:text-4xl">You&apos;re on the board.</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600"><span className="font-semibold text-stone-900">{result.name}</span> has a DAAV. You&apos;re ready to go.</p>
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{result.message}<p className="mt-1 text-xs">You can add more details later. Payments and paid ranking are not enabled yet.</p></div>
          <Link href="/" className="primary-button mt-5 w-full">Explore DAAV <ArrowRight size={16}/></Link>
        </div> : <>
          <h1 className="mt-7 text-3xl font-black tracking-[-0.06em] sm:text-4xl">Your company. Your DAAV.</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">Enter your company or product name. That&apos;s it. No website, documents, description, sector, or verification steps.</p>
          {!signedIn && error && <p role="alert" className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900">{error}</p>}
          {signedIn && <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block text-sm font-semibold">Company or product name
              <input autoFocus required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Neem AI" className="mt-2 min-h-12 w-full rounded-lg border border-[#ded5c8] bg-white px-3 text-base outline-none focus:border-[#c96e31]"/>
            </label>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700">{error}</p>}
            <button disabled={loading} className="primary-button w-full disabled:cursor-wait disabled:opacity-60">{loading ? <LoaderCircle size={16} className="animate-spin"/> : <Sparkles size={16}/>}{loading ? "Creating your DAAV…" : "Create my DAAV"}{!loading && <ArrowRight size={16}/>}</button>
          </form>}
        </>}
      </div>
    </div>
  </main>;
}
