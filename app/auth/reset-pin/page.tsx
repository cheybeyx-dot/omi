// app/auth/reset-pin/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPinPage() {
  const router = useRouter();
  useEffect(() => {
    async function reset() {
      await supabase.auth.signOut();
      document.cookie = "pin_verified=; path=/; max-age=0";
      router.replace("/auth/signin");
    }
    reset();
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#030712" }}
    >
      <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );
}
