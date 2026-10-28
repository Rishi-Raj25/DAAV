"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/submit` },
        });
        if (authError) throw authError;
        if (data.session) router.push("/submit");
        else setMessage("Account created! Check your email to confirm your address, then sign in to continue.");
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
        router.push("/submit");
        router.refresh();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  }

  return <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto w-full max-w-[440px]">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-stone-950"><ArrowLeft size={16}/> Back to DAAV</Link>
      <div className="panel mt-8 p-6 sm:p-8">
        <div className="brand-mark">द</div>
        <p className="mini-label mt-6">Apna product. Apni pehchaan.</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.06em]">{mode === "signup" ? "Join the board." : "Welcome back."}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">{mode === "signup" ? "Create an account to submit your product for review." : "Sign in to continue managing your product listing."}</p>
        <div className="mt-6 grid grid-cols-2 rounded-xl bg-[#f0ece4] p-1">
          <button type="button" onClick={() => { setMode("signup"); setError(""); setMessage(""); }} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === "signup" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>Create account</button>
          <button type="button" onClick={() => { setMode("signin"); setError(""); setMessage(""); }} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === "signin" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>Sign in</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold">Email address<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 min-h-11 w-full rounded-lg border border-[#ded5c8] bg-white px-3 text-sm outline-none transition focus:border-[#c96e31]"/></label>
          <label className="block text-sm font-semibold">Password<input required minLength={8} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" className="mt-2 min-h-11 w-full rounded-lg border border-[#ded5c8] bg-white px-3 text-sm outline-none transition focus:border-[#c96e31]"/></label>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-5 text-emerald-800">{message}</p>}
          <button disabled={loading} className="primary-button w-full disabled:cursor-wait disabled:opacity-65">{loading ? <LoaderCircle size={16} className="animate-spin"/> : null}{loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}{!loading && <ArrowRight size={16}/>}</button>
        </form>
        <div className="mt-5 flex gap-2 rounded-lg bg-[#f7f4ee] p-3 text-[11px] leading-5 text-stone-500"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-700"/><span>Accounts are handled by Supabase. Your password is never stored by DAAV directly.</span></div>
      </div>
      <p className="mt-5 text-center text-xs text-stone-500">By continuing, you agree to use DAAV responsibly. Terms and privacy details will be published before public launch.</p>
    </div>
  </main>;
}
