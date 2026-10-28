"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  ChevronDown,
  Clock3,
  ExternalLink,
  IndianRupee,
  ListFilter,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { demoListings, formatINR } from "@/lib/demo-data";

const categories = [
  "All products",
  "AI & Tech",
  "Indian SaaS",
  "D2C & Brands",
  "Developer Tools",
  "Design & Creator",
];

function Header() {
  return (
    <header className="masthead sticky top-0 z-20">
      <div className="container-daav flex h-[72px] items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-3" aria-label="DAAV home">
          <span className="brand-mark">द</span>
          <span>
            <span className="block text-[19px] font-black tracking-[-0.06em]">DAAV<span style={{ color: "var(--saffron)" }}>.</span></span>
            <span className="block text-[10px] tracking-[0.12em] text-stone-500">INDIA KA PRODUCT BOARD</span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-[13px] font-semibold text-stone-600 md:flex">
          <a href="#leaderboard" className="hover:text-stone-950">Leaderboard</a>
          <a href="#how-it-works" className="hover:text-stone-950">How it works</a>
          <a href="#trust" className="hover:text-stone-950">Verification</a>
        </nav>
        <a href="#list-product" className="primary-button !min-h-[40px] !px-3 sm:!px-4">
          <span>List your product</span><ArrowRight size={15} />
        </a>
      </div>
    </header>
  );
}

export default function HomePage() {
  const [board, setBoard] = useState<"today" | "alltime">("today");
  const [category, setCategory] = useState("All products");
  const [search, setSearch] = useState("");

  const listings = useMemo(() => {
    return demoListings
      .filter((item) => category === "All products" || item.category === category)
      .filter((item) => (item.name + " " + item.description).toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.amountPaise - a.amountPaise);
  }, [category, search]);

  return (
    <main>
      <Header />

      <section className="container-daav grid gap-9 pb-12 pt-12 md:grid-cols-[1.04fr_.96fr] md:items-center md:gap-12 md:pb-16 md:pt-16">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e8d7c4] bg-[#fcf0e2] px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#9f5c2c]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c96e31]" />
            BUILT FOR INDIA’S NEXT BIG THING
          </div>
          <h1 className="max-w-[620px] text-[42px] font-black leading-[1.03] tracking-[-0.065em] sm:text-[56px] lg:text-[66px]">
            Achha product hai?
            <span className="mt-1 block" style={{ color: "var(--saffron)" }}>Duniya ko dikhao.</span>
          </h1>
          <p className="mt-5 max-w-[500px] text-[16px] leading-7 text-stone-600">
            India’s product leaderboard. List what you’re building, verify your details, and compete for a spot on Aaj Ka Daav.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#list-product" className="primary-button">List your product <ArrowUpRight size={16} /></a>
            <a href="#leaderboard" className="secondary-button">See the leaderboard</a>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-stone-500">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Verification first</span>
            <span className="flex items-center gap-1.5"><IndianRupee size={14} /> INR rankings</span>
            <span className="flex items-center gap-1.5"><Clock3 size={14} /> Daily reset in IST</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-2 -top-5 h-28 w-28 rounded-full bg-[#f1d9bc] opacity-55 blur-3xl" />
          <div className="panel relative overflow-hidden p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="mini-label">Aaj ka daav</p>
                <h2 className="mt-1 text-[23px] font-extrabold tracking-[-0.04em]">The top spot is open.</h2>
                <p className="mt-1 text-[12px] text-stone-500">Demo leaderboard · Not live bids</p>
              </div>
              <span className="rounded-lg bg-[#f7eee2] p-2.5 text-[#a65d28]"><Trophy size={20} /></span>
            </div>
            <div className="mt-5 rounded-xl border border-[#ead8c3] bg-[#fcf4e9] p-4">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.11em] text-[#9c622f]">
                <span>Featured spot</span><span>01 / Today</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-sm font-black text-stone-700 shadow-sm">UL</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">Udaan Labs</p>
                  <p className="mt-0.5 text-[12px] text-stone-500">Indian SaaS · Example listing</p>
                </div>
                <p className="text-[20px] font-black tracking-tight">₹12,500</p>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-stone-500">Illustrative amount for UI preview only. No payment has been made.</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-stone-200 p-3">
                <p className="text-[11px] text-stone-500">Ranking rule</p>
                <p className="mt-1 text-[13px] font-bold">Higher paid total = higher rank</p>
              </div>
              <div className="rounded-xl border border-stone-200 p-3">
                <p className="text-[11px] text-stone-500">Trust rule</p>
                <p className="mt-1 text-[13px] font-bold">Verify before ranking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="leaderboard" className="border-y border-[#e8e1d5] bg-[#f0ece4] py-12 sm:py-14">
        <div className="container-daav">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mini-label">The leaderboard</p>
              <h2 className="mt-2 text-[31px] font-black tracking-[-0.055em] sm:text-[37px]">Who’s making a daav?</h2>
              <p className="mt-2 text-sm text-stone-600">Products putting themselves on the map.</p>
            </div>
            <div className="inline-flex w-fit rounded-xl border border-[#ded5c8] bg-white p-1">
              <button onClick={() => setBoard("today")} className={`rounded-lg px-4 py-2 text-[13px] font-bold transition-colors ${board === "today" ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-900"}`}>Aaj Ka Daav</button>
              <button onClick={() => setBoard("alltime")} className={`rounded-lg px-4 py-2 text-[13px] font-bold transition-colors ${board === "alltime" ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-900"}`}>All-time</button>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <label className="flex min-h-11 flex-1 items-center gap-2 rounded-lg border border-[#ded5c8] bg-white px-3">
              <Search size={16} className="text-stone-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400" />
            </label>
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-[#ded5c8] bg-white px-3">
              <ListFilter size={15} className="text-stone-400" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="max-w-[220px] bg-transparent text-sm outline-none">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
              <ChevronDown size={14} className="text-stone-400" />
            </label>
          </div>

          <div className="panel mt-4 overflow-hidden">
            <div className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e8e1d5] bg-[#fcfaf6] px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-stone-400 sm:grid-cols-[52px_minmax(0,1fr)_112px_105px] sm:px-5">
              <span>Rank</span><span>Product</span><span className="hidden sm:block">Category</span><span className="text-right">Paid total*</span>
            </div>
            {listings.length ? listings.map((item, index) => (
              <div key={item.id} className="rank-row grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:grid-cols-[52px_minmax(0,1fr)_112px_105px] sm:px-5">
                <span className={`rank-number ${index === 0 ? "first" : ""}`}>{String(index + 1).padStart(2, "0")}</span>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-stone-200 bg-[#f6f1e8] text-[11px] font-black text-stone-600">{item.initials}</div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-[13px] font-bold">{item.name}</p>
                      {item.verified && <BadgeCheck size={14} className="shrink-0 text-emerald-700" aria-label="Demo verified" />}
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] text-stone-500">{item.description}</p>
                  </div>
                </div>
                <span className="hidden text-[11px] text-stone-500 sm:block">{item.category}</span>
                <div className="text-right">
                  <p className="text-[14px] font-extrabold tracking-tight">{formatINR(item.amountPaise)}</p>
                  <p className="mt-1 text-[10px] text-stone-400">{board === "today" ? "Today · demo" : "Lifetime · demo"}</p>
                </div>
              </div>
            )) : (
              <div className="px-5 py-12 text-center text-sm text-stone-500">No products match that search. Try another term or category.</div>
            )}
            <div className="border-t border-[#e8e1d5] bg-[#fcfaf6] px-5 py-3 text-[11px] leading-5 text-stone-500">
              * Demo amounts only. A production leaderboard will use server-confirmed payments and clearly disclose paid placement.
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container-daav py-12 sm:py-16">
        <div className="max-w-[620px]">
          <p className="mini-label">Seedha scene</p>
          <h2 className="mt-2 text-[31px] font-black tracking-[-0.055em] sm:text-[37px]">Simple rules. Clear rankings.</h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">No points, no votes, no confusing formulas. Verification checks eligibility; verified payment totals determine the rank.</p>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {[
            { n: "01", title: "List your product", body: "Share the product name, website and basic details so the team can review it.", icon: Building2 },
            { n: "02", title: "Get verified", body: "Official records where applicable, or a manual review for legitimate independent products.", icon: ShieldCheck },
            { n: "03", title: "Make your daav", body: "After approval, make a paid placement. Verified payments update your eligible rank.", icon: IndianRupee },
          ].map((item) => {
            const Icon = item.icon;
            return <article key={item.n} className="panel p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-stone-400">{item.n}</span>
                <Icon size={19} className="text-[#bd6b32]" />
              </div>
              <h3 className="mt-6 text-[17px] font-extrabold">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-stone-600">{item.body}</p>
            </article>;
          })}
        </div>
      </section>

      <section id="trust" className="container-daav pb-12 sm:pb-16">
        <div className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#edf2e9] text-[#426b3b]"><ShieldCheck size={22} /></div>
          <div className="flex-1">
            <h3 className="font-extrabold">Verification matters.</h3>
            <p className="mt-1 max-w-[700px] text-[13px] leading-6 text-stone-600">A verified badge means the submitted details passed an eligibility review. It does not mean DAAV endorses a company or guarantees results. Ranking is based on eligible paid placement.</p>
          </div>
          <a href="#list-product" className="secondary-button shrink-0">Verification policy <ArrowRight size={14} className="ml-2" /></a>
        </div>
      </section>

      <section id="list-product" className="container-daav pb-14">
        <div className="overflow-hidden rounded-2xl bg-[#27251f] p-6 text-white sm:p-9">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.16em] text-[#e9ad72]">YOUR PRODUCT. YOUR MOVE.</p>
              <h2 className="mt-3 text-[29px] font-black tracking-[-0.05em] sm:text-[36px]">India, meet what you’re building.</h2>
              <p className="mt-2 max-w-[550px] text-[13px] leading-6 text-stone-300">The submission flow will open once authentication and verification services are configured. This preview does not accept payments.</p>
            </div>
            <button onClick={() => window.alert("DAAV is a development preview. Authentication and payments are not connected yet.")} className="primary-button w-fit !bg-[#d27b3e]">List your product <ArrowRight size={16} /></button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e8e1d5] py-6">
        <div className="container-daav flex flex-col justify-between gap-3 text-[11px] text-stone-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} DAAV. Built for India’s makers.</p>
          <p className="flex items-center gap-2"><Sparkles size={12} /> A development preview — demo listings and amounts only.</p>
        </div>
      </footer>
    </main>
  );
}
