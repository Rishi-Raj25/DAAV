"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Globe, LoaderCircle, Sparkles } from "lucide-react";

type ResultState = { message: string; name: string; website: string };

export default function SubmitProductPage() {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, website }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof payload.message === "string" ? payload.message : "We couldn't create your DAAV. Please try again.");
        return;
      }
      setResult({ message: payload.message || "Your DAAV is ready.", name, website: payload.listing?.website_url || website });
    } catch {
      setError("We couldn't reach DAAV right now. Your DAAV may not have been created; please try again.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto w-full max-w-[600px]">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-stone-950"><ArrowLeft size={16}/> Back to DAAV</Link>
      <div className="panel mt-8 p-5 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="brand-mark">द</div>
          <div><p className="mini-label">Create your DAAV</p><p className="mt-1 text-xs text-stone-500">Two details. You&apos;re in.</p></div>
        </div>
        {result ? <div className="mt-7">
          <CheckCircle2 size={30} className="text-emerald-700"/>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.06em] sm:text-4xl">You&apos;re on the board.</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600"><span className="font-semibold text-stone-900">{result.name}</span> has a DAAV. You&apos;re ready to go.</p>
          <p className="mt-2 break-all text-sm text-stone-600"><Globe size={15} className="mr-1 inline"/>{result.website}</p>
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{result.message}<p className="mt-1 text-xs">You can add more details later. Payments and paid ranking are not enabled yet.</p></div>
          <Link href="/" className="primary-button mt-5 w-full">Explore DAAV <ArrowRight size={16}/></Link>
        </div> : <>
          <h1 className="mt-7 text-3xl font-black tracking-[-0.06em] sm:text-4xl">Your company. Your DAAV.</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">Enter your company name and website URL. That&apos;s it. No sign-up, login, documents, or verification steps.</p>
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block text-sm font-semibold">Company or product name
              <input autoFocus required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. KARMA AI" className="mt-2 min-h-12 w-full rounded-lg border border-[#ded5c8] bg-white px-3 text-base outline-none focus:border-[#c96e31]"/>
            </label>
            <label className="block text-sm font-semibold">Company website URL
              <input required type="text" maxLength={300} value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://yourcompany.in" autoCapitalize="none" autoCorrect="off" className="mt-2 min-h-12 w-full rounded-lg border border-[#ded5c8] bg-white px-3 text-base outline-none focus:border-[#c96e31]"/>
              <span className="mt-1 block text-xs font-normal text-stone-500">Enter your public website. We only check the URL format, not the website content.</span>
            </label>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700">{error}</p>}
            <button disabled={loading} className="primary-button w-full disabled:cursor-wait disabled:opacity-60">{loading ? <LoaderCircle size={16} className="animate-spin"/> : <Sparkles size={16}/>}{loading ? "Creating your DAAV…" : "Create my DAAV"}{!loading && <ArrowRight size={16}/>}</button>
          </form>
        </>}
      </div>
    </div>
  </main>;
}
