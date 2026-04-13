"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Copy,
  Check,
  Share2,
  ChevronRight,
  X,
  MapPin,
  ChevronDown,
  Phone,
  User,
  Mail,
  Trophy,
  Gift,
} from "lucide-react";

const REFERRER_PCT = 20;
const REFERRED_PCT = 10;
const MONTHLY_GOAL = 150;

// Real prize images from the uploaded photos
const PRIZES = [
  {
    emoji: "🚗",
    label: "Luxury Car",
    sublabel: "Premium sedan, fully loaded — delivered to you",
    target: 120,
    img: "/prizes/car.jpg", // will use base64 below
    gradient: "from-slate-800 to-slate-900",
    accent: "#e2e8f0",
  },
  {
    emoji: "📱",
    label: "iPhone + Samsung",
    sublabel: "Latest flagship phones, dual bundle",
    target: 50,
    img: "/prizes/phones.jpg",
    gradient: "from-slate-800 to-slate-900",
    accent: "#a78bfa",
  },
  {
    emoji: "❄️",
    label: "Samsung Fridge",
    sublabel: "Premium Bespoke French Door refrigerator",
    target: 30,
    img: "/prizes/fridge.jpg",
    gradient: "from-slate-800 to-slate-900",
    accent: "#38bdf8",
  },
];

const LIVE = [
  "Alex K. joined via referral · earned $12.40",
  "Maria T. activated Node · referrer got $24.80",
  "James O. completed 47 tasks today",
  "Sarah M. just joined · GPU plan active",
  "Chen W. upgraded plan · $31.50 bonus paid",
  "Aisha B. referred 3 users this week",
];

function getShareMsg(code: string, origin: string) {
  return `🚀 Earn passive income with OmniTask GPU Network!\n\n💰 Join using my link and get a ${REFERRED_PCT}% welcome bonus on your first payment.\n⚡ Rent GPU power, earn daily.\n🔗 ${origin}/auth/signup?ref=${code}\n\nCode: ${code}`;
}

function WAIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path
        d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
        fill="#25D366"
      />
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.78 12.78 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
        fill="white"
      />
    </svg>
  );
}
function TGIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#2CA5E0" />
      <path
        d="M17.707 7.28l-1.96 9.243c-.147.658-.53.818-1.075.508l-2.977-2.194-1.437 1.383c-.159.159-.292.292-.6.292l.214-3.032 5.53-4.997c.24-.214-.052-.333-.373-.119l-6.835 4.302-2.944-.92c-.64-.2-.652-.64.134-.948l11.49-4.429c.533-.193 1 .13.833.91z"
        fill="white"
      />
    </svg>
  );
}
function XIc() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#000" />
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        fill="white"
      />
    </svg>
  );
}

function LiveTicker() {
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVis(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % LIVE.length);
        setVis(true);
      }, 300);
    }, 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2 overflow-hidden max-w-full">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
      <span
        className={`text-xs text-slate-400 truncate transition-opacity duration-300 ${vis ? "opacity-100" : "opacity-0"}`}
      >
        {LIVE[idx]}
      </span>
    </div>
  );
}

function ShareModal({ code, onClose }: { code: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/auth/signup?ref=${code}`;
  const msg = getShareMsg(code, origin);

  function share(p: string) {
    const em = encodeURIComponent(msg);
    const el = encodeURIComponent(link);
    const urls: Record<string, string> = {
      wa: `https://wa.me/?text=${em}`,
      tg: `https://t.me/share/url?url=${el}&text=${encodeURIComponent(msg.slice(0, 200))}`,
      x: `https://twitter.com/intent/tweet?text=${em}`,
    };
    window.open(urls[p], "_blank", "noopener,width=600,height=600");
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <p className="text-white font-black text-sm">
              Share Your Referral Link
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              They get {REFERRED_PCT}% bonus · You get {REFERRER_PCT}% of their
              payments
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-white p-1"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "wa", label: "WhatsApp", Icon: WAIcon },
              { id: "tg", label: "Telegram", Icon: TGIcon },
              { id: "x", label: "X (Twitter)", Icon: XIc },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => share(id)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-700/50 hover:border-slate-600 bg-slate-800/30 hover:bg-slate-800/60 transition-all"
              >
                <Icon />
                <span className="text-[10px] font-bold text-slate-400">
                  {label}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-800 border border-slate-700/40 rounded-xl px-3 py-2.5 text-slate-400 text-xs font-mono truncate">
              {link}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}{" "}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Delivery form modal
function DeliveryModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "",
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!form.full_name || !form.phone || !form.address || !form.country) {
      alert("Please fill all required fields");
      return;
    }
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("users")
        .update({
          full_name: form.full_name,
          phone: form.phone,
          delivery_address: form.address,
          city: form.city,
          country: form.country,
          delivery_details_submitted: true,
        })
        .eq("id", user.id);
    }
    setSaving(false);
    setDone(true);
    setTimeout(() => {
      onSaved();
      onClose();
    }, 1500);
  }

  const fields = [
    {
      key: "full_name",
      label: "Full Name *",
      placeholder: "John Doe",
      icon: User,
    },
    {
      key: "phone",
      label: "Phone Number *",
      placeholder: "+234 800 000 0000",
      icon: Phone,
    },
    {
      key: "email",
      label: "Email Address",
      placeholder: "you@email.com",
      icon: Mail,
    },
    {
      key: "address",
      label: "Delivery Address *",
      placeholder: "12 Main Street, Flat 3",
      icon: MapPin,
    },
    { key: "city", label: "City", placeholder: "Lagos", icon: MapPin },
    {
      key: "country",
      label: "Country *",
      placeholder: "Nigeria",
      icon: MapPin,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/20 rounded-2xl w-full max-w-md shadow-2xl my-4">
        <div
          className="flex items-center justify-between p-5 border-b border-slate-800"
          style={{
            background:
              "linear-gradient(135deg, rgba(245,158,11,0.08), transparent)",
          }}
        >
          <div>
            <p className="text-white font-black text-base">
              🎁 Delivery Details
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              Fill in your details to qualify for prize delivery
            </p>
          </div>
          {/* Hide close button when not yet submitted - it's a gating requirement */}
          {false && (
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="p-5 space-y-3">
          {done ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-white font-black text-lg">Details Saved!</p>
              <p className="text-slate-400 text-sm mt-1">
                You're now registered for prize delivery.
              </p>
            </div>
          ) : (
            <>
              {fields.map(({ key, label, placeholder, icon: Icon }) => (
                <div key={key}>
                  <label className="text-slate-400 text-xs font-bold flex items-center gap-1.5 mb-1.5">
                    <Icon size={10} className="text-amber-400" /> {label}
                  </label>
                  <input
                    value={(form as any)[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              ))}
              <button
                onClick={submit}
                disabled={saving}
                className="w-full py-3.5 rounded-xl font-black text-sm transition-all mt-2 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#0f172a",
                }}
              >
                {saving ? "Saving..." : "✅ Save & Start Tracking Progress"}
              </button>
              <p className="text-slate-600 text-[10px] text-center">
                Your details are securely stored and only used for prize
                delivery
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NetworkPage() {
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showMyReferrals, setShowMyReferrals] = useState(false);

  const [referralCode, setReferralCode] = useState("");
  const [totalEarned, setTotalEarned] = useState(0);
  const [weeklyEarned, setWeeklyEarned] = useState(0);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [deliverySubmitted, setDeliverySubmitted] = useState(false);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("users")
      .select(
        "referral_code, referral_earnings, delivery_details_submitted, country",
      )
      .eq("id", user.id)
      .single();

    let code = profile?.referral_code;
    if (!code) {
      code = `REF-${user.id.slice(0, 8).toUpperCase()}`;
      await supabase
        .from("users")
        .update({ referral_code: code })
        .eq("id", user.id);
    }
    setReferralCode(code);
    setTotalEarned(profile?.referral_earnings || 0);
    setDeliverySubmitted(profile?.delivery_details_submitted || false);

    const { data: refs } = await supabase
      .from("users")
      .select("id, full_name, tier, node_expiry_date, created_at")
      .eq("referred_by", user.id)
      .order("created_at", { ascending: false });
    setReferrals(refs || []);

    const now = new Date();
    const active = (refs || []).filter(
      (r) => r.node_expiry_date && new Date(r.node_expiry_date) > now,
    );
    setActiveCount(active.length);

    // Monthly count
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();
    const { count: mCount } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", user.id)
      .gte("created_at", monthStart);
    setMonthlyCount(mCount || 0);

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: weekComm } = await supabase
      .from("referral_commissions")
      .select("commission_amount")
      .eq("referrer_id", user.id)
      .gte("created_at", weekAgo);
    setWeeklyEarned(
      (weekComm || []).reduce(
        (s: number, c: any) => s + (c.commission_amount || 0),
        0,
      ),
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function copyLink() {
    navigator.clipboard.writeText(`${origin}/auth/signup?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const monthlyPct = Math.min(
    Math.round((monthlyCount / MONTHLY_GOAL) * 100),
    100,
  );
  const daysLeft = (() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return Math.ceil((end.getTime() - now.getTime()) / 86400000);
  })();

  if (loading)
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "#060b14" }}
      >
        <div className="w-8 h-8 border-2 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );

  // Delivery gate: if not submitted, show full-screen delivery modal
  if (!deliverySubmitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#060b14", color: "#cbd5e1" }}
      >
        <DeliveryModal
          onClose={() => {}} // Don't allow close without submitting
          onSaved={() => setDeliverySubmitted(true)}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "#060b14", color: "#cbd5e1" }}
    >
      {showShare && (
        <ShareModal code={referralCode} onClose={() => setShowShare(false)} />
      )}

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* ── HEADER ────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">Referral Network</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Earn {REFERRER_PCT}% · They get {REFERRED_PCT}% · Win luxury
              prizes
            </p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/30 rounded-full px-3 py-1.5 max-w-[150px] overflow-hidden">
            <LiveTicker />
          </div>
        </div>

        {/* ── PRIZES HERO ───────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #0d1628 0%, #080e1a 100%)",
            border: "1px solid rgba(255,215,0,0.18)",
          }}
        >
          {/* Gold top bar */}
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{
              background:
                "linear-gradient(90deg, rgba(245,158,11,0.12), rgba(234,179,8,0.06))",
              borderBottom: "1px solid rgba(255,215,0,0.12)",
            }}
          >
            <Trophy size={14} className="text-yellow-400" />
            <p className="text-yellow-300 font-black text-sm">
              OmniTask Pro Luxury Prize Programme
            </p>
            <span className="ml-auto text-[9px] font-black text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
              EXCLUSIVE
            </span>
          </div>

          <div className="p-4 space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed">
              Refer <strong className="text-yellow-400">150 people</strong> this
              month and stand a chance to win luxury prizes — delivered directly
              to your door. Prizes reset monthly.
            </p>

            {/* Prize cards with real images */}
            <div className="space-y-3">
              {/* Car */}
              <div
                className="relative rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                  }}
                />
                <div className="relative flex items-center gap-3 p-3">
                  <div
                    className="w-20 h-16 rounded-lg overflow-hidden shrink-0 relative"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <img
                      src="/prizes/car.jpg"
                      alt="Luxury Car Prize"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-white font-black text-sm">
                        Luxury Car
                      </p>
                      <span className="text-yellow-400 font-black text-xs shrink-0">
                        120 refs
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mb-2">
                      Premium sedan, fully loaded — with red ribbon 🎀
                    </p>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min((monthlyCount / 120) * 100, 100)}%`,
                          background:
                            "linear-gradient(90deg, #f59e0b, #fbbf24)",
                        }}
                      />
                    </div>
                    <p className="text-slate-600 text-[9px] mt-0.5">
                      {monthlyCount}/120 referrals
                    </p>
                  </div>
                </div>
              </div>

              {/* Phones */}
              <div
                className="relative rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                  }}
                />
                <div className="relative flex items-center gap-3 p-3">
                  <div
                    className="w-20 h-16 rounded-lg overflow-hidden shrink-0"
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <img
                      src="/prizes/phones.jpg"
                      alt="iPhone and Samsung Phones"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-white font-black text-sm">
                        iPhone 16 Pro + Samsung S25 Ultra
                      </p>
                      <span className="text-violet-400 font-black text-xs shrink-0">
                        50 refs
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mb-2">
                      Dual flagship bundle — both phones, both boxes
                    </p>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min((monthlyCount / 50) * 100, 100)}%`,
                          background:
                            "linear-gradient(90deg, #8b5cf6, #a78bfa)",
                        }}
                      />
                    </div>
                    <p className="text-slate-600 text-[9px] mt-0.5">
                      {monthlyCount}/50 referrals
                    </p>
                  </div>
                </div>
              </div>

              {/* Fridge */}
              <div
                className="relative rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                  }}
                />
                <div className="relative flex items-center gap-3 p-3">
                  <div
                    className="w-20 h-16 rounded-lg overflow-hidden shrink-0"
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <img
                      src="/prizes/fridge.jpg"
                      alt="Samsung Bespoke Fridge"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-white font-black text-sm">
                        Samsung Bespoke Fridge
                      </p>
                      <span className="text-blue-400 font-black text-xs shrink-0">
                        30 refs
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mb-2">
                      Premium French Door refrigerator, custom panel
                    </p>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min((monthlyCount / 30) * 100, 100)}%`,
                          background:
                            "linear-gradient(90deg, #3b82f6, #60a5fa)",
                        }}
                      />
                    </div>
                    <p className="text-slate-600 text-[9px] mt-0.5">
                      {monthlyCount}/30 referrals
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly progress bar */}
            <div
              className="rounded-xl p-3 space-y-2"
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,215,0,0.1)",
              }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">
                  Monthly Progress
                </span>
                <span className="text-yellow-400 font-black">
                  {monthlyCount} / {MONTHLY_GOAL}
                </span>
              </div>
              <div className="relative h-4 bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                  style={{
                    width: `${Math.max(monthlyPct, 1)}%`,
                    background:
                      "linear-gradient(90deg, #f59e0b, #fbbf24, #facc15)",
                  }}
                >
                  <div
                    className="absolute inset-0 animate-pulse opacity-30"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, white, transparent)",
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-600">
                  Resets in{" "}
                  <strong className="text-amber-400">{daysLeft} days</strong> ·
                  Monthly reset
                </span>
                <span className="text-slate-500">{monthlyPct}%</span>
              </div>
            </div>

            {/* Delivery confirmation badge - always shown since it's now a gate */}
            <div
              className="rounded-xl p-3 flex items-center gap-3"
              style={{
                background: "rgba(16,185,129,0.07)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <Check size={16} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-emerald-400 font-bold text-sm">
                  Delivery details submitted ✓
                </p>
                <p className="text-slate-500 text-xs">
                  You&apos;re registered. Keep referring to win!
                </p>
              </div>
              <button
                onClick={() => setShowDelivery(true)}
                className="ml-auto text-slate-500 hover:text-slate-300 text-xs underline shrink-0"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* ── EARNINGS OVERVIEW ─────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total Earned",
              value: `$${totalEarned.toFixed(2)}`,
              color: "#10b981",
            },
            {
              label: "This Week",
              value: `$${weeklyEarned.toFixed(2)}`,
              color: "#f59e0b",
            },
            { label: "Referrals", value: referrals.length, color: "#3b82f6" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl p-3.5 text-center"
              style={{
                background: "rgba(15,23,42,0.8)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="font-black text-lg" style={{ color }}>
                {value}
              </p>
              <p className="text-slate-600 text-[10px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── YOUR LINK ─────────────────────────────────────── */}
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-white font-bold text-sm">Your Referral Link</p>
            <span className="text-emerald-400 text-[10px] font-mono bg-emerald-900/20 border border-emerald-800/30 px-2 py-0.5 rounded">
              {referralCode}
            </span>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 bg-slate-800/60 border border-slate-700/30 rounded-xl px-3 py-2.5 text-slate-500 text-xs font-mono truncate">
              {origin}/auth/signup?ref={referralCode}
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all shrink-0"
            >
              {copied ? (
                <Check size={11} className="text-emerald-400" />
              ) : (
                <Copy size={11} />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div
              className="rounded-xl p-3 text-center"
              style={{
                background: "rgba(16,185,129,0.07)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <p className="text-emerald-400 font-black text-xl">
                {REFERRER_PCT}%
              </p>
              <p className="text-slate-500 text-[10px]">
                You earn of their payments
              </p>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{
                background: "rgba(59,130,246,0.07)",
                border: "1px solid rgba(59,130,246,0.15)",
              }}
            >
              <p className="text-blue-400 font-black text-xl">
                {REFERRED_PCT}%
              </p>
              <p className="text-slate-500 text-[10px]">
                They get on first payment
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowShare(true)}
            className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: "linear-gradient(135deg, #059669, #10b981)",
              color: "white",
              boxShadow: "0 4px 15px rgba(16,185,129,0.25)",
            }}
          >
            <Share2 size={14} /> Share Now <ChevronRight size={13} />
          </button>
        </div>

        {/* ── HOW IT WORKS (collapsed) ───────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <button
            onClick={() => setShowHowItWorks((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-800/20 transition-colors"
          >
            <span className="text-white font-bold text-sm">How It Works</span>
            <ChevronDown
              size={14}
              className={`text-slate-500 transition-transform ${showHowItWorks ? "rotate-180" : ""}`}
            />
          </button>
          {showHowItWorks && (
            <div className="px-4 pb-4 border-t border-slate-800/50 space-y-3 pt-3">
              {[
                {
                  n: "1",
                  t: "Fill your delivery details",
                  d: "Submit your name, phone, address and country above",
                },
                {
                  n: "2",
                  t: "Share your link",
                  d: "Copy and share via WhatsApp, Telegram, or anywhere",
                },
                {
                  n: "3",
                  t: "They sign up & pay",
                  d: `They get ${REFERRED_PCT}% bonus on first payment`,
                },
                {
                  n: "4",
                  t: "You earn forever",
                  d: `${REFERRER_PCT}% of every payment they ever make — no limit`,
                },
                {
                  n: "5",
                  t: "Hit 150 referrals this month",
                  d: "Win a luxury prize delivered to your door",
                },
              ].map(({ n, t, d }) => (
                <div key={n} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-emerald-400 text-[9px] font-black">
                      {n}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">{t}</p>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      {d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── MY REFERRALS (collapsed) ──────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <button
            onClick={() => setShowMyReferrals((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-800/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">
                My Referrals ({referrals.length})
              </span>
              {activeCount > 0 && (
                <span className="flex items-center gap-1 text-emerald-400 text-[9px] font-black bg-emerald-900/20 border border-emerald-800/30 px-2 py-0.5 rounded-full">
                  <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />{" "}
                  {activeCount} active
                </span>
              )}
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-500 transition-transform ${showMyReferrals ? "rotate-180" : ""}`}
            />
          </button>
          {showMyReferrals && (
            <div className="border-t border-slate-800/50">
              {referrals.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <Gift size={24} className="mx-auto text-slate-700" />
                  <p className="text-slate-400 text-sm">No referrals yet</p>
                  <p className="text-slate-600 text-xs">
                    Share your link to start earning
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/40 max-h-60 overflow-y-auto">
                  {referrals.map((r, i) => {
                    const isActive =
                      r.node_expiry_date &&
                      new Date(r.node_expiry_date) > new Date();
                    return (
                      <div
                        key={r.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 text-sm font-semibold truncate">
                            {r.full_name ||
                              `User ${r.id.slice(0, 6).toUpperCase()}`}
                          </p>
                          <p className="text-slate-600 text-[10px]">
                            {r.tier || "free"} ·{" "}
                            {new Date(r.created_at).toLocaleDateString("en", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-black px-2 py-1 rounded-full ${isActive ? "bg-emerald-900/20 border border-emerald-800/30 text-emerald-400" : "bg-slate-800 text-slate-600"}`}
                        >
                          {isActive ? "ACTIVE" : "PENDING"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── STICKY BOTTOM CTA ─────────────────────────────── */}
        <div
          className="fixed bottom-0 left-0 right-0 p-4"
          style={{
            background: "linear-gradient(0deg, #060b14 60%, transparent)",
          }}
        >
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setShowShare(true)}
              className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: "linear-gradient(135deg, #059669, #10b981)",
                boxShadow: "0 8px 25px rgba(16,185,129,0.35)",
                color: "white",
              }}
            >
              <Share2 size={15} /> Share Link — Earn {REFERRER_PCT}% of Their
              Payments <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
