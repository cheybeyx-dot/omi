"use client";
// components/auth/signup-form.tsx
// Reads ?ref= from URL and saves referred_by on signup

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

function SignUpFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!agreed) {
      setError("Please agree to the terms");
      return;
    }

    setLoading(true);

    try {
      // 1. Create auth user
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim() } },
      });

      if (authErr) {
        setError(authErr.message);
        setLoading(false);
        return;
      }
      const userId = authData.user?.id;
      if (!userId) {
        setError("Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Resolve referral code → find referrer's user ID
      let referredBy: string | null = null;
      if (refCode) {
        const { data: referrer } = await supabase
          .from("users")
          .select("id")
          .eq("referral_code", refCode)
          .neq("id", userId)
          .single();
        if (referrer?.id) referredBy = referrer.id;
      }

      // 3. Upsert user profile row with referred_by
      const { error: profileErr } = await supabase.from("users").upsert(
        {
          id: userId,
          full_name: fullName.trim(),
          email: email.trim(),
          referred_by: referredBy,
          referral_earnings: 0,
          referral_bonus_claimed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (profileErr) {
        console.error("Profile upsert error:", profileErr);
        // Don't block signup for profile errors — auth succeeded
      }

      router.push("/auth/set-pin");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {refCode && (
        <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg px-3 py-2.5 text-xs text-emerald-300">
          🎁 Referral code <strong>{refCode}</strong> applied — you'll get a 10%
          bonus on your first payment!
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2.5 text-xs text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-1.5">
          FULL NAME
        </label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="John Doe"
          className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-1.5">
          EMAIL ADDRESS
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@email.com"
          className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-1.5">
          PASSWORD
        </label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Min. 6 characters"
            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-1.5">
          CONFIRM PASSWORD
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          placeholder="Repeat password"
          className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 rounded accent-emerald-500"
        />
        <span className="text-slate-400 text-xs leading-relaxed">
          I agree to the{" "}
          <Link href="/terms" className="text-emerald-400 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-emerald-400 hover:underline">
            Privacy Policy
          </Link>
        </span>
      </label>

      <button
        type="submit"
        disabled={loading || !agreed}
        className="w-full py-3.5 rounded-lg font-black text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, #059669, #10b981)",
          color: "white",
        }}
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>

      <p className="text-center text-slate-500 text-sm">
        Already have an account?{" "}
        <Link
          href="/auth/signin"
          className="text-emerald-400 hover:underline font-semibold"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  return (
    <Suspense
      fallback={
        <div className="text-slate-400 text-sm text-center py-4">
          Loading...
        </div>
      }
    >
      <SignUpFormInner />
    </Suspense>
  );
}
