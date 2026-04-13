"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Shield,
  CheckCircle,
  Zap,
  Clock,
  Database,
  Eye,
  Lock,
  Activity,
  TrendingUp,
  Globe,
  ChevronDown,
  Users,
  BarChart3,
  Server,
  Award,
  Star,
  Building2,
} from "lucide-react";

// ── COUNTER ANIMATION HOOK ─────────────────────────────────────────────────
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ── INTERSECTION OBSERVER HOOK ────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── ANIMATED COUNTER STAT ─────────────────────────────────────────────────
function StatCounter({
  value,
  suffix = "",
  prefix = "",
  label,
  color = "text-emerald-400",
  inView,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  color?: string;
  inView: boolean;
}) {
  const count = useCounter(value, 2200, inView);
  return (
    <div className="text-center">
      <p
        className={`text-4xl md:text-5xl font-black ${color} mb-1`}
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">
        {label}
      </p>
    </div>
  );
}

// ── FAQ COMPONENT ──────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      className={`border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${open ? "border-emerald-500/30 bg-slate-900" : "border-slate-800 bg-slate-900/30 hover:border-slate-700"}`}
    >
      <div className="flex justify-between items-center p-5 md:p-6 gap-4">
        <span className="text-white font-semibold text-sm md:text-base">
          {q}
        </span>
        <ChevronDown
          size={16}
          className={`text-emerald-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && (
        <div className="px-5 md:px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-slate-800 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

const FAQS = [
  {
    q: "What is OmniTask Pro?",
    a: "OmniTask Pro is an institutional-grade distributed GPU computing platform. Participants invest in dedicated NVIDIA GPU nodes within our Tier III/IV global data centre network. These nodes continuously process AI training workloads from enterprise clients — Fortune 500 technology firms, research institutions, and AI laboratories — generating daily returns credited directly to your dashboard in real time.",
  },
  {
    q: "How do I start earning on OmniTask Pro?",
    a: "Create your account, complete KYC identity verification, select a GPU node plan from the GPU Plans section of your dashboard, and make your investment via bank transfer, card, or cryptocurrency (USDT TRC-20/ERC-20). Your node activates within 24–48 hours of payment confirmation and begins accruing earnings immediately at 0.13% per day on your invested capital.",
  },
  {
    q: "What is the minimum investment and how are returns calculated?",
    a: "The minimum investment is $5 for the Foundation Node tier. Returns accrue at a base rate of 0.13% per day of your invested capital. Contract-based plans (6, 12, and 24-month terms) offer projected return ranges of 52%–93%, 130%–250%, and 800%–1,200% respectively. Returns are calculated on our secure backend infrastructure and synchronised to your dashboard every 60 seconds.",
  },
  {
    q: "Is KYC verification required before I can withdraw?",
    a: "Yes. All participants must complete full identity verification (KYC) before withdrawal privileges are granted. This includes submitting a government-issued ID, proof of address, and selfie verification. Your registered payout account name must exactly match your verified identity. This requirement protects all participants and ensures compliance with international AML standards.",
  },
  {
    q: "How does the withdrawal process work?",
    a: "Withdrawals are processed through the Financials section of your dashboard. The minimum withdrawal is $10. Withdrawal requests pass through a multi-layer security validation including KYC check, balance verification, and fraud detection before processing. You can track the status of your withdrawal in real time: Queued → Processing → In Transit → Paid. Processing times range from 24 hours to 7 business days depending on amount.",
  },
  {
    q: "Are my returns guaranteed?",
    a: "No. OmniTask Pro explicitly does not guarantee any fixed return, daily percentage, or minimum income. All projected return figures are estimates based on historical platform performance and current enterprise contract rates. Actual returns depend on GPU utilisation rates, market demand, and network conditions. Participants should not invest capital they cannot afford to lose.",
  },
  {
    q: "What GPU hardware tiers are available?",
    a: "OmniTask Pro offers six hardware tiers: Foundation Node (NVIDIA T4/L4 Shared, from $5), Standard Node (RTX 4090, from $100), Professional Node (A100 PCIe 40GB, from $500), Enterprise Node (A100 SXM4 80GB, from $2,000), H100 PCIe Node (from $5,000), and H100 SXM5 Cluster (institutional tier, from $25,000). All plans accrue at the same base daily rate.",
  },
  {
    q: "What is OmniTask Pro's company background?",
    a: "OmniTask Pro Ltd. is incorporated in England and Wales (Registration No. OT-2024-GB-7741902), headquartered at Level 14, One Canada Square, Canary Wharf, London. The company is governed by a Board of Directors chaired by Dmitriy Ardalio and operates under UK FCA guidelines with full AML/KYC compliance. The platform serves 180+ enterprise clients with 12,400+ active GPU nodes across six global operational regions.",
  },
];

// ── TRUST BADGES ──────────────────────────────────────────────────────────
const TRUST = [
  {
    icon: Shield,
    label: "KYC / AML Verified",
    sub: "All participants verified",
  },
  { icon: Award, label: "UK FCA Compliant", sub: "Regulatory framework" },
  { icon: Lock, label: "AES-256 Encrypted", sub: "Bank-grade security" },
  { icon: Globe, label: "6 Global Regions", sub: "Tier III/IV data centres" },
  { icon: Users, label: "9,800+ Investors", sub: "Verified globally" },
  { icon: BarChart3, label: "99.81% Uptime", sub: "12-month average" },
];

// ── ENTERPRISE LOGOS (SVG icon brands) ───────────────────────────────────
const PARTNERS = [
  { name: "DataFlow AI" },
  { name: "VoiceSync Labs" },
  { name: "SentimentAI" },
  { name: "NeuralNet Inc" },
  { name: "ContentPro" },
  { name: "TruthSeek" },
  { name: "ChatMaster AI" },
  { name: "ShopFlow" },
  { name: "DevQuality" },
  { name: "MediDoc AI" },
];

// ── PLATFORM FEATURES ─────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Zap,
    title: "Real-Time Earnings Dashboard",
    desc: "Watch your GPU node earnings accrue live — updated every second. Balance synchronised to our database every 60 seconds. Full transparency on every calculation, task, and accrual event.",
  },
  {
    icon: Shield,
    title: "Multi-Layer Security Architecture",
    desc: "AES-256 encryption, SHA-256 PIN authentication, row-level database security, atomic balance operations, and real-time fraud detection. Enterprise-grade security built into every transaction.",
  },
  {
    icon: Database,
    title: "Verified Blockchain Payment Processing",
    desc: "Accept USDT via TRC-20 and ERC-20 networks. Card and bank transfers processed globally. Every payment tracked with full audit trails and automatic node activation upon confirmation.",
  },
  {
    icon: Eye,
    title: "Transparent KYC & Compliance",
    desc: "Government-issued ID verification, AML screening, and payout account name matching required before any withdrawal. UK GDPR compliant. Regulated under FCA guidelines.",
  },
  {
    icon: TrendingUp,
    title: "Contract & Flexible Investment Plans",
    desc: "Choose flexible rolling plans or commit to 6, 12, or 24-month contract terms for enhanced projected returns. All plans start from $5. Earnings accrual begins the moment your node activates.",
  },
  {
    icon: Globe,
    title: "Global Enterprise Client Network",
    desc: "180+ enterprise clients including AI laboratories, research institutions, financial services firms, and Fortune 500 technology companies submit workloads to our GPU network 24 hours a day.",
  },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const statsRef = useInView(0.3);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden">
      {/* ── SEO: Hidden text block for crawlers ──────────────────────────── */}
      <div className="sr-only" aria-hidden="true">
        OmniTask Pro is a distributed GPU computing investment platform at
        omnitaskpro.online. Earn daily returns from enterprise AI GPU workloads.
        GPU node investment platform. Passive income from AI infrastructure.
        NVIDIA GPU H100 A100 RTX 4090 investment. GPU rental income platform.
        Daily GPU earnings. AI compute investment. Company: OmniTask Pro Ltd.
        Registration OT-2024-GB-7741902. London, UK. Chairperson: Dmitriy
        Ardalio. 12400 GPU nodes. 180 enterprise clients. 9800 investors. GPU
        computing platform online. omnitaskpro. omnitask pro investment.
      </div>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-slate-950/95 border-b border-slate-800/60 backdrop-blur-xl" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-slate-950 font-black text-sm">OT</span>
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              Omni<span className="text-emerald-400">Task</span>
              <span className="text-slate-500 font-light ml-1 text-sm">
                PRO
              </span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm">
            {[
              ["Platform", "#platform"],
              ["How It Works", "#how"],
              ["Security", "#security"],
              ["FAQ", "#faq"],
            ].map(([l, h]) => (
              <a
                key={h}
                href={h}
                className="text-slate-400 hover:text-white transition-colors font-medium"
              >
                {l}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <button className="text-slate-400 hover:text-white text-sm transition-colors px-4 py-2 font-medium hidden md:block">
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                Get Started <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20 px-4 md:px-6"
        aria-label="OmniTask Pro GPU Computing Investment Platform"
      >
        {/* Background effects */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.04 }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(#34d399 1px,transparent 1px),linear-gradient(90deg,#34d399 1px,transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
        </div>
        <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/6 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-blue-500/4 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-violet-500/3 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 max-w-6xl mx-auto w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase px-4 md:px-5 py-2 md:py-2.5 rounded-full mb-6 md:mb-10">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            OT-2024-GB-7741902 · Regulated · London, UK
          </div>

          {/* H1 — keyword rich for SEO */}
          <h1
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.02] tracking-tight mb-6 md:mb-8"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            The World&apos;s Most
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #34d399, #10b981, #06b6d4)",
              }}
            >
              Trusted GPU
            </span>
            <br />
            Computing Platform
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-4 md:mb-6 font-light">
            OmniTask Pro connects{" "}
            <strong className="text-white font-semibold">
              9,800+ verified investors
            </strong>{" "}
            with enterprise AI computing demand — generating daily returns from{" "}
            <strong className="text-white font-semibold">$47.2M</strong> in
            quarterly GPU compute revenue.
          </p>

          <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed">
            Invest from $5. Earn 0.13% daily on your capital. Withdraw weekly.
            No technical knowledge required. Full KYC compliance. UK regulated.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-12 md:mb-20">
            <Link href="/auth/signup">
              <button className="group w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 md:px-10 py-4 md:py-5 rounded-xl transition-all flex items-center justify-center gap-3 text-base md:text-lg shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105">
                Start Earning Today
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform hidden sm:block"
                />
              </button>
            </Link>
            <Link href="/dashboard/company-disclosure">
              <button className="w-full sm:w-auto border border-slate-700 hover:border-emerald-500/40 text-white font-semibold px-6 md:px-10 py-4 md:py-5 rounded-xl transition-all text-base md:text-lg hover:bg-slate-900/50 backdrop-blur-sm">
                Read company-disclosure
              </button>
            </Link>
          </div>

          {/* Live stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
            {[
              { v: "$47.2M+", l: "Q1 2026 Revenue" },
              { v: "12,400+", l: "Active GPU Nodes" },
              { v: "180+", l: "Enterprise Clients" },
              { v: "99.81%", l: "Network Uptime" },
            ].map(({ v, l }) => (
              <div
                key={l}
                className="border border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-5 bg-slate-900/50 backdrop-blur-sm hover:border-emerald-500/20 transition-all hover:bg-slate-900/80"
              >
                <p
                  className="text-xl md:text-2xl font-black text-white mb-1"
                  style={{ fontFamily: "Georgia" }}
                >
                  {v}
                </p>
                <p className="text-slate-500 text-xs uppercase tracking-wider">
                  {l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES STRIP ──────────────────────────────────────────── */}
      <section
        className="border-t border-slate-800/50 bg-slate-900/30 py-14"
        aria-label="Platform certifications and trust indicators"
      >
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-slate-500 text-xs tracking-widest uppercase mb-10 font-bold">
            Compliance · Security · Regulatory Standards
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {TRUST.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 text-center group"
              >
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center group-hover:border-emerald-500/40 transition-all">
                  <Icon size={20} className="text-emerald-400" />
                </div>
                <p className="text-white text-xs font-bold leading-tight">
                  {label}
                </p>
                <p className="text-slate-600 text-[10px] uppercase tracking-wider">
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE PARTNERS ─────────────────────────────────────────── */}
      <section
        className="border-t border-slate-800/50 py-16"
        aria-label="Enterprise AI clients using OmniTask Pro GPU network"
      >
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-slate-500 text-xs tracking-widest uppercase mb-12 font-bold">
            GPU compute capacity powering 180+ enterprise AI organisations
            worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
            {PARTNERS.map(({ name }) => (
              <div
                key={name}
                className="opacity-35 hover:opacity-80 transition-opacity duration-300"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-slate-400 text-sm font-bold tracking-wide uppercase text-[11px]">
                    {name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANIMATED STATS ──────────────────────────────────────────────── */}
      <section
        className="border-t border-slate-800/50 py-28 bg-slate-900/10"
        aria-label="OmniTask Pro platform statistics"
      >
        <div className="max-w-6xl mx-auto px-6" ref={statsRef.ref}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              <Activity size={11} /> Live Platform Metrics
            </div>
            <h2
              className="text-4xl md:text-5xl font-black text-white"
              style={{ fontFamily: "Georgia" }}
            >
              Infrastructure at Global Scale
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatCounter
              value={9800}
              suffix="+"
              label="Verified Investors"
              color="text-emerald-400"
              inView={statsRef.inView}
            />
            <StatCounter
              value={12400}
              suffix="+"
              label="Active GPU Nodes"
              color="text-blue-400"
              inView={statsRef.inView}
            />
            <StatCounter
              value={180}
              suffix="+"
              label="Enterprise Clients"
              color="text-violet-400"
              inView={statsRef.inView}
            />
            <StatCounter
              value={47}
              prefix="$"
              suffix=".2M+"
              label="Q1 2026 Revenue"
              color="text-amber-400"
              inView={statsRef.inView}
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section
        id="how"
        className="border-t border-slate-800/50 py-28"
        aria-label="How OmniTask Pro GPU investment works"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              <Zap size={11} /> Simple 4-Step Process
            </div>
            <h2
              className="text-4xl md:text-5xl font-black text-white mb-4"
              style={{ fontFamily: "Georgia" }}
            >
              Start Earning in 48 Hours
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              From registration to daily GPU earnings — a structured,
              compliance-first onboarding pathway.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                icon: Users,
                title: "Create Your Account",
                desc: "Register with your email address and set a secure security PIN. Phone verification and device registration complete your account setup. No technical knowledge required.",
              },
              {
                step: "02",
                icon: CheckCircle,
                title: "Complete KYC Verification",
                desc: "Submit your government-issued identity document and proof of address through the Verification section of your dashboard. Compliance review completed within 24–48 hours.",
              },
              {
                step: "03",
                icon: Server,
                title: "Select a GPU Node Plan",
                desc: "Browse available GPU node tiers in the GPU Plans section — from Foundation ($5) to institutional H100 clusters. Pay via card, bank transfer, or USDT cryptocurrency.",
              },
              {
                step: "04",
                icon: TrendingUp,
                title: "Earn Daily Returns",
                desc: "Your GPU node begins accruing returns at 0.13% per day upon activation. Watch earnings grow in real time. Withdraw from $10 minimum once your KYC is approved.",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div
                key={step}
                className="relative p-7 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-emerald-500/20 transition-all group hover:bg-slate-900/60"
              >
                <div
                  className="text-slate-800 font-black text-6xl absolute top-3 right-4 group-hover:text-slate-700 transition-colors select-none"
                  style={{ fontFamily: "Georgia" }}
                >
                  {step}
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-5">
                  <Icon size={22} className="text-emerald-400" />
                </div>
                <h3 className="text-white font-bold text-base mb-3">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES ───────────────────────────────────────────── */}
      <section
        id="platform"
        className="border-t border-slate-800/50 py-28 bg-slate-900/10"
        aria-label="OmniTask Pro platform features"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              <Database size={11} /> Platform Architecture
            </div>
            <h2
              className="text-4xl md:text-5xl font-black text-white mb-4"
              style={{ fontFamily: "Georgia" }}
            >
              Built for Institutional Grade
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Every layer of OmniTask Pro is engineered to institutional
              security, regulatory compliance, and capital protection standards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-7 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-emerald-500/20 transition-all hover:bg-slate-900/60 group"
              >
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:border-emerald-500/40 transition-all">
                  <Icon size={22} className="text-emerald-400" />
                </div>
                <h3 className="text-white font-bold text-base mb-3">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INVESTMENT RETURNS OVERVIEW ─────────────────────────────────── */}
      <section
        className="border-t border-slate-800/50 py-28"
        aria-label="OmniTask Pro investment returns and earnings structure"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
                <TrendingUp size={11} /> Return Structure
              </div>
              <h2
                className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight"
                style={{ fontFamily: "Georgia" }}
              >
                Transparent Earnings.
                <br />
                <span className="text-emerald-400">Daily Accrual.</span>
                <br />
                Weekly Withdrawal.
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8 text-lg">
                Every GPU compute session your node completes is verified by our
                backend and credited immediately to your dashboard. Earnings
                calculated on secure, audited infrastructure — what the system
                calculates is what you receive.
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: CheckCircle,
                    text: "0.13% base daily accrual rate on invested capital",
                  },
                  {
                    icon: Lock,
                    text: "All calculations performed on audited server infrastructure",
                  },
                  {
                    icon: Clock,
                    text: "Minimum withdrawal $10 · Available once KYC approved",
                  },
                  {
                    icon: Shield,
                    text: "Full real-time dashboard with live balance synchronisation",
                  },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-emerald-400" />
                    </div>
                    <span className="text-slate-300 text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Return table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700">
                <p className="text-white font-bold text-sm uppercase tracking-wider">
                  Projected Return Summary
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Based on historical platform performance · Not guaranteed
                </p>
              </div>
              <div className="p-6 space-y-0">
                {[
                  {
                    plan: "Flexible (Rolling)",
                    capital: "From $5",
                    daily: "0.13% / day",
                    projected: "Variable",
                    color: "text-slate-300",
                  },
                  {
                    plan: "6-Month Contract",
                    capital: "From $5",
                    daily: "0.13%+ / day",
                    projected: "52% – 93%",
                    color: "text-emerald-400",
                  },
                  {
                    plan: "12-Month Contract",
                    capital: "From $5",
                    daily: "0.13%+ / day",
                    projected: "130% – 250%",
                    color: "text-blue-400",
                  },
                  {
                    plan: "24-Month Contract",
                    capital: "From $5",
                    daily: "0.13%+ / day",
                    projected: "800% – 1,200%",
                    color: "text-violet-400",
                  },
                ].map(({ plan, capital, daily, projected, color }) => (
                  <div
                    key={plan}
                    className="flex items-center justify-between py-4 border-b border-slate-800/60 last:border-0"
                  >
                    <div>
                      <p className="text-white font-semibold text-sm">{plan}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {capital} · {daily}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-sm ${color}`}>
                        {projected}
                      </p>
                      <p className="text-slate-600 text-[10px] mt-0.5">
                        projected total return
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6">
                <Link href="/auth/signup">
                  <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                    Open Your Account <ArrowRight size={14} />
                  </button>
                </Link>
                <p className="text-slate-600 text-xs text-center mt-3">
                  Past performance does not guarantee future returns. Capital at
                  risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY SECTION ────────────────────────────────────────────── */}
      <section
        id="security"
        className="border-t border-slate-800/50 py-28 bg-slate-900/10"
        aria-label="OmniTask Pro security and compliance framework"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              <Shield size={11} /> Security & Compliance
            </div>
            <h2
              className="text-4xl md:text-5xl font-black text-white mb-4"
              style={{ fontFamily: "Georgia" }}
            >
              Bank-Grade Security Infrastructure
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              OmniTask Pro is built on the same security architecture trusted by
              regulated financial institutions worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Shield,
                title: "KYC & AML Verification",
                desc: "All investors complete government-issued identity verification and anti-money laundering checks before node activation. Payout account name must match verified identity. UK GDPR and Data Protection Act 2018 compliant.",
              },
              {
                icon: Lock,
                title: "Atomic Financial Security",
                desc: "All balance operations are processed through atomic database transactions with row-level locking. Race conditions, double-spend vulnerabilities, and concurrent modification errors are architecturally impossible.",
              },
              {
                icon: Eye,
                title: "Real-Time Fraud Detection",
                desc: "Automated fraud detection monitors all withdrawal requests for account flags, KYC mismatches, balance discrepancies, and suspicious patterns. Flagged accounts are automatically suspended and reviewed.",
              },
              {
                icon: Database,
                title: "Audited Server Calculations",
                desc: "All earnings, commissions, and withdrawal calculations are performed exclusively on secure, audited backend infrastructure. Client dashboards display only server-verified balances — never client-calculated figures.",
              },
              {
                icon: Building2,
                title: "UK Regulatory Compliance",
                desc: "OmniTask Pro Ltd. operates under UK FCA guidelines, registered in England and Wales (OT-2024-GB-7741902). Full compliance with AML regulations, KYC obligations, and data protection law.",
              },
              {
                icon: Star,
                title: "Multi-Layer PIN Authentication",
                desc: "Every new session requires PIN verification — SHA-256 hashed with unique user salt, stored independently of account credentials. Five consecutive failures trigger automatic 30-minute account lock.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-7 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all"
              >
                <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-5">
                  <Icon size={19} className="text-emerald-400" />
                </div>
                <h3 className="text-white font-bold mb-2 text-base">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Company info bar */}
          <div className="border border-slate-700 rounded-2xl p-8 bg-slate-900/60">
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-bold">
                  Company Registration
                </p>
                <p className="text-white font-bold">OmniTask Pro Ltd.</p>
                <p className="text-slate-400 text-sm">
                  Reg. No. OT-2024-GB-7741902
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  England & Wales, United Kingdom
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-bold">
                  Registered Address
                </p>
                <p className="text-slate-300 text-sm">
                  Level 14, One Canada Square
                </p>
                <p className="text-slate-300 text-sm">
                  Canary Wharf, London E14 5AB
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Governance: Dmitriy Ardalio, Chairperson
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-bold">
                  Compliance Status
                </p>
                <div className="flex flex-col gap-1">
                  {[
                    "UK FCA Compliant",
                    "GDPR Certified",
                    "AML/KYC Certified",
                    "Data Protection Act 2018",
                  ].map((c) => (
                    <div key={c} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      <span className="text-slate-400 text-xs">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS / SOCIAL PROOF ─────────────────────────────────── */}
      <section
        className="border-t border-slate-800/50 py-28"
        aria-label="OmniTask Pro investor reviews"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              <Star size={11} /> Investor Testimonials
            </div>
            <h2
              className="text-4xl md:text-5xl font-black text-white"
              style={{ fontFamily: "Georgia" }}
            >
              Trusted by Investors Worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "M. Bongani",
                location: "Captown, SA",
                tier: "H100 PCIe Node",
                text: "The platform's transparency is what convinced me. Every transaction visible, every earning verified server-side. Withdrew $2,400 last month without any issues after completing KYC.",
                rating: 5,
              },
              {
                name: "T. Ryder",
                location: "LA, U.S",
                tier: "Enterprise Node",
                text: "I was sceptical at first, read the full company-disclosure and the legal documents. The company registration, the London address, the board structure — everything checks out. Solid platform.",
                rating: 5,
              },
              {
                name: "K. Alfie",
                location: "Manchester, UK",
                tier: "Professional Node",
                text: "Customer support responded within 3 hours when I had a payment question. KYC was smooth. My 12-month contract is running well and earnings are visible in real time.",
                rating: 5,
              },
            ].map(({ name, location, tier, text, rating }) => (
              <div
                key={name}
                className="p-7 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5 italic">
                  &ldquo;{text}&rdquo;
                </p>
                <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-white font-bold text-sm">{name}</p>
                    <p className="text-slate-500 text-xs">{location}</p>
                  </div>
                  <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    {tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section
        id="faq"
        className="border-t border-slate-800/50 py-28 bg-slate-900/10"
        aria-label="OmniTask Pro frequently asked questions"
      >
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              <CheckCircle size={11} /> Investor Q&A
            </div>
            <h2
              className="text-4xl md:text-5xl font-black text-white mb-4"
              style={{ fontFamily: "Georgia" }}
            >
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-lg">
              Clear, honest answers about how OmniTask Pro works, returns,
              compliance, and security.
            </p>
          </div>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <section
        className="border-t border-slate-800/50 py-28"
        aria-label="Join OmniTask Pro GPU investment platform"
      >
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div
            className="relative p-14 md:p-20 rounded-3xl border border-emerald-500/15 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(15,23,42,1) 60%)",
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/6 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Join 9,800+ Verified Investors
              </div>
              <h2
                className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight"
                style={{ fontFamily: "Georgia" }}
              >
                The AI Economy Is
                <br />
                <span className="text-emerald-400">Generating Wealth.</span>
                <br />
                Own a Piece of It.
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
                Create your account in 2 minutes. Complete KYC verification.
                Select a GPU node from $5. Begin earning daily returns from
                enterprise AI infrastructure worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <button className="group bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-10 py-5 rounded-xl transition-all text-lg flex items-center gap-3 mx-auto shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-105">
                    Create Free Account
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </Link>
                <Link href="/dashboard/company-disclosure">
                  <button className="border border-slate-700 hover:border-slate-500 text-white font-semibold px-10 py-5 rounded-xl transition-all text-lg">
                    Read Full company-disclosure
                  </button>
                </Link>
              </div>
              <p className="text-slate-600 text-xs mt-8">
                omnitaskpro.online · OmniTask Pro Ltd. · Reg. OT-2024-GB-7741902
                · Canary Wharf, London
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer
        className="border-t border-slate-800 bg-slate-950"
        aria-label="OmniTask Pro footer"
      >
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-5 gap-10 mb-14">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-slate-950 font-black text-sm">OT</span>
                </div>
                <span className="text-xl font-black text-white">
                  Omni<span className="text-emerald-400">Task</span>
                  <span className="text-slate-600 font-light ml-1 text-sm">
                    PRO
                  </span>
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-xs">
                Distributed GPU computing investment platform. Earn daily
                returns from enterprise AI workloads processed across our global
                data centre network.
              </p>
              <div className="space-y-1">
                <p className="text-xs text-slate-600">
                  OmniTask Pro Ltd. · Reg. OT-2024-GB-7741902
                </p>
                <p className="text-xs text-slate-600">
                  Level 14, One Canada Square, London E14 5AB
                </p>
                <p className="text-xs text-slate-600">
                  compliance@omnitaskpro.io · omnitaskpro.online
                </p>
              </div>
            </div>

            {/* Investors */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm tracking-wider uppercase">
                Investors
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {[
                  ["Create Account", "/auth/signup"],
                  ["Sign In", "/auth/signin"],
                  ["Dashboard", "/dashboard"],
                  ["GPU Plans", "/dashboard/gpu-plans"],
                  ["Financials", "/dashboard/financials"],
                ].map(([l, h]) => (
                  <li key={l}>
                    <Link
                      href={h}
                      className="hover:text-emerald-400 transition-colors"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm tracking-wider uppercase">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {[
                  ["How It Works", "/#how"],
                  ["Security", "/#security"],
                  ["company-disclosure", "/dashboard/company-disclosure"],
                  ["FAQ", "/#faq"],
                  ["Tasks", "/dashboard/tasks"],
                ].map(([l, h]) => (
                  <li key={l}>
                    <a
                      href={h}
                      className="hover:text-emerald-400 transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm tracking-wider uppercase">
                Legal
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {[
                  ["Terms of Service", "/terms"],
                  ["Privacy Policy", "/privacy"],
                  ["License Agreement", "/contributor-agreement"],
                  ["Contact", "/contact"],
                  ["About Us", "/about"],
                ].map(([l, h]) => (
                  <li key={l}>
                    <Link
                      href={h}
                      className="hover:text-emerald-400 transition-colors"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-xs text-slate-600 mb-1">
                  &copy; 2026 OmniTask Pro Ltd. All rights reserved. Registered
                  in England & Wales.
                </p>
                <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                  <strong className="text-slate-600">Risk Disclosure:</strong>{" "}
                  Investing in GPU node plans involves risk. Returns are not
                  guaranteed. Capital at risk. Past performance is not
                  indicative of future results. This platform does not
                  constitute regulated investment advice under the Financial
                  Services and Markets Act 2000. Please read the full
                  company-disclosure and risk disclosures before investing.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest">
                  All Systems Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
