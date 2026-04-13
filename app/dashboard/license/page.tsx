"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardNavigation from "@/components/dashboard-navigation";
import {
  Shield,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  Zap,
  Lock,
  Globe,
  Server,
  TrendingUp,
  Star,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const BENEFITS = [
  {
    icon: Zap,
    title: "Daily Thermal Calibration",
    desc: "Earn $0.50 every day by running a single GPU optimization task. Resets at midnight. Streak bonuses after 7 days.",
    value: "$0.50 / day",
    color: "text-blue-400",
    bg: "bg-blue-900/20 border-blue-700/30",
  },
  {
    icon: Server,
    title: "RLHF Validation Tasks",
    desc: "Help train enterprise AI models. Each response validation earns $0.10. No limit on daily submissions.",
    value: "$0.10 / task",
    color: "text-violet-400",
    bg: "bg-violet-900/20 border-violet-700/30",
  },
  {
    icon: TrendingUp,
    title: "GPU Client Allocation",
    desc: "Assign your node to live enterprise AI clients. Earn continuously — every hour your node is allocated.",
    value: "Hourly revenue",
    color: "text-emerald-400",
    bg: "bg-emerald-900/20 border-emerald-700/30",
  },
  {
    icon: Star,
    title: "Premium Client Access",
    desc: "Unlock Project Beta (2.1x), Epsilon (3x), and Zeta (1.6x) — clients unavailable to standard operators.",
    value: "Up to 3x multiplier",
    color: "text-amber-400",
    bg: "bg-amber-900/20 border-amber-700/30",
  },
  {
    icon: Globe,
    title: "Priority Node Routing",
    desc: "Your allocations are processed first in the queue. Higher uptime, faster task delivery, and lower idle time.",
    value: "First in queue",
    color: "text-cyan-400",
    bg: "bg-cyan-900/20 border-cyan-700/30",
  },
  {
    icon: Shield,
    title: "Certified Operator Seal",
    desc: "A verified badge on your contributor profile and a certification seal on all weekly compute reports.",
    value: "Lifetime credential",
    color: "text-rose-400",
    bg: "bg-rose-900/20 border-rose-700/30",
  },
];

const FAQS = [
  {
    q: "Is this a subscription?",
    a: "No. The $200 is a one-time fee valid for 4 years. After purchase, a $5.00 infrastructure surcharge is deducted from your balance every 30 days to cover cooling and electricity costs for your allocated node.",
  },
  {
    q: "When do I start earning?",
    a: "Immediately after your license is activated. You can assign your GPU node to a client within minutes of purchasing and start accumulating hourly earnings right away.",
  },
  {
    q: "What is the inactivity policy?",
    a: "If your node goes unassigned for 3 or more consecutive days, a 20% capital deduction is applied to your balance. This compensates AI clients for unallocated compute time. Assign your GPU daily to avoid this.",
  },
  {
    q: "Can I recover my $200 license fee?",
    a: "Yes. Based on current demand patterns, most operators recover their initial capital within 48–83 days depending on the GPU tier and client multipliers selected. This is not guaranteed.",
  },
  {
    q: "What happens after 4 years?",
    a: "You can renew your license for another 4 years at $200. Your wallet balance, history, and node configuration are fully preserved.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. Payments are processed via our licensed payment partner with 256-bit SSL encryption and PCI DSS Level 1 compliance. Card details never touch our servers.",
  },
];

const TERMS = [
  "The Certified AI Operator License grants the licensee a non-exclusive, non-transferable right to participate in the OmniTask Pro compute contribution network for a period of four (4) years from the date of activation.",
  "Earnings are derived from real GPU compute workloads executed on behalf of enterprise AI clients. OmniTask Pro does not guarantee specific earnings levels. Historical performance data is provided for reference only.",
  "A monthly infrastructure surcharge of $5.00 USD is automatically deducted from the operator's available balance every 30 days following license activation. This covers cooling, electricity, and maintenance costs.",
  "Operators who fail to assign their GPU node for three (3) or more consecutive calendar days will be subject to a 20% inactivity deduction applied to their total available balance.",
  "OmniTask Pro reserves the right to suspend or revoke a license in cases of fraudulent activity, violation of platform terms, or abuse of the compute network.",
  "All sales are final. Refunds are not available after a license is activated and a GPU node has been assigned to a client.",
  "By purchasing this license, you confirm that you are at least 18 years of age, that participation is legal in your jurisdiction, and that you accept these terms in full.",
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/20 transition-colors gap-3"
      >
        <span className="text-white text-sm font-semibold">{q}</span>
        {open ? (
          <ChevronUp size={15} className="text-slate-500 shrink-0" />
        ) : (
          <ChevronDown size={15} className="text-slate-500 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-slate-800">
          <p className="text-slate-400 text-sm leading-relaxed pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── INNER COMPONENT (uses useSearchParams) ───────────────────
function LicenseInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const licenseType = searchParams.get("licenseType") || "operator_license";
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <DashboardNavigation />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-6 pb-32 md:pb-16 space-y-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-sm"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {/* Hero */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-16 h-16 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex items-center justify-center shrink-0">
                <Shield size={28} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 rounded-full">
                    Official Certification
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  Certified AI Operator License
                </h1>
                <p className="text-slate-400 mt-2 text-base max-w-xl leading-relaxed">
                  Your credential to participate in the OmniTask Pro global
                  compute network. One-time purchase. Four years of access.
                  Immediate activation.
                </p>
              </div>
              <div className="shrink-0 text-center md:text-right">
                <p className="text-slate-500 text-sm">One-time fee</p>
                <p className="text-5xl font-black text-white">$200</p>
                <p className="text-slate-500 text-xs mt-1">
                  + $5.00/mo infrastructure
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h2 className="text-white font-black text-xl mb-1">
              What you unlock
            </h2>
            <p className="text-slate-500 text-sm mb-5">
              Every feature below is activated the moment your license is
              confirmed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BENEFITS.map(({ icon: Icon, title, desc, value, color, bg }) => (
                <div
                  key={title}
                  className={`rounded-2xl border p-5 ${bg} flex gap-4`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-slate-900/60 flex items-center justify-center shrink-0 ${color}`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-white font-bold text-sm">{title}</h3>
                      <span
                        className={`text-[10px] font-black whitespace-nowrap ${color}`}
                      >
                        {value}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fee schedule */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-black text-lg flex items-center gap-2">
              <Clock size={16} className="text-slate-400" /> Fee Schedule
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: "License Activation",
                  amount: "$200.00",
                  timing: "One-time, today",
                  color: "text-amber-400",
                },
                {
                  label: "Infrastructure Surcharge",
                  amount: "$5.00",
                  timing: "Every 30 days after activation",
                  color: "text-red-400",
                },
                {
                  label: "Inactivity Penalty",
                  amount: "20% of balance",
                  timing: "After 3 consecutive inactive days",
                  color: "text-red-500",
                },
                {
                  label: "Renewal (after 4 years)",
                  amount: "$200.00",
                  timing: "Optional — balance preserved",
                  color: "text-slate-400",
                },
              ].map(({ label, amount, timing, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 py-2 border-b border-slate-800/60 last:border-0"
                >
                  <div>
                    <p className="text-white text-sm font-semibold">{label}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{timing}</p>
                  </div>
                  <span className={`font-black text-sm shrink-0 ${color}`}>
                    {amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-white font-black text-xl mb-4">
              Frequently asked questions
            </h2>
            <div className="space-y-2">
              {FAQS.map((faq) => (
                <FAQItem key={faq.q} {...faq} />
              ))}
            </div>
          </div>

          {/* Terms */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setTermsOpen(!termsOpen)}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-800/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-slate-400" />
                <span className="text-white font-bold text-sm">
                  License Terms & Conditions
                </span>
              </div>
              {termsOpen ? (
                <ChevronUp size={15} className="text-slate-500" />
              ) : (
                <ChevronDown size={15} className="text-slate-500" />
              )}
            </button>
            {termsOpen && (
              <div className="px-5 pb-5 border-t border-slate-800 space-y-3">
                {TERMS.map((term, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-slate-600 text-xs font-mono shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, "0")}.
                    </span>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {term}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="bg-slate-900 border border-amber-500/20 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                <Lock size={16} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-black text-base">
                  Ready to activate?
                </h3>
                <p className="text-slate-500 text-xs">
                  Accept terms below then proceed to secure checkout
                </p>
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">License (4 years)</span>
                <span className="text-white font-bold">$200.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Monthly infrastructure</span>
                <span className="text-red-400 font-bold">+$5.00/mo</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between">
                <span className="text-white font-black">Due today</span>
                <span className="text-amber-400 font-black text-lg">
                  $200.00
                </span>
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => setTermsAccepted((v) => !v)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${termsAccepted ? "bg-emerald-500 border-emerald-500" : "border-slate-600 bg-transparent"}`}
              >
                {termsAccepted && (
                  <CheckCircle size={12} className="text-slate-950" />
                )}
              </div>
              <p className="text-slate-400 text-xs leading-relaxed group-hover:text-slate-300 transition-colors">
                I have read and agree to the License Terms & Conditions above. I
                understand that earnings are not guaranteed and the $5.00
                monthly infrastructure surcharge will be deducted from my
                balance automatically.
              </p>
            </label>
            <button
              onClick={() => {
                if (!termsAccepted) return;
                router.push(
                  `/dashboard/checkout?purchaseType=license&licenseType=${licenseType}&node=${licenseType}&price=200&name=Certified+AI+Operator+License`,
                );
              }}
              disabled={!termsAccepted}
              className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all ${termsAccepted ? "bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer" : "bg-slate-800 text-slate-600 cursor-not-allowed"}`}
            >
              <Lock size={16} /> Proceed to Secure Checkout — $200.00{" "}
              <ChevronRight size={16} />
            </button>
            <div className="flex items-center justify-center gap-5 pt-1">
              {["SSL Secured", "PCI Compliant", "256-bit Encrypted"].map(
                (b) => (
                  <div key={b} className="flex items-center gap-1">
                    <Shield size={9} className="text-slate-600" />
                    <span className="text-slate-600 text-[9px] uppercase tracking-wide">
                      {b}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="h-6 md:h-2" />
        </div>
      </div>
    </div>
  );
}

// ─── EXPORT with Suspense wrapper ────────────────────────────
export default function LicensePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="w-10 h-10 border-2 border-t-amber-400 rounded-full animate-spin" />
        </div>
      }
    >
      <LicenseInner />
    </Suspense>
  );
}
