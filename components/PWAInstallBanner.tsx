"use client";
// components/PWAInstallBanner.tsx
// THE ONLY PWA component — replaces both old files
// Delete: components/pwa-install-prompt.tsx if it exists
//
// This handles:
// 1. "Add to Home Screen" install prompt
// 2. Push notification permission
// 3. Saves push token to Supabase push_tokens table

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// ── Push token helper ──────────────────────────────────────────────────────
const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

async function savePushToken(token: string): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("push_tokens")
      .upsert(
        { user_id: user.id, token, platform: "web", active: true },
        { onConflict: "user_id,token" },
      );
  } catch (e) {
    console.warn("Failed to save push token:", e);
  }
}

// ── Main component ─────────────────────────────────────────────────────────
export default function PWAInstallBanner() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [installDone, setInstallDone] = useState(false);
  const [notifDone, setNotifDone] = useState(false);

  // ── Register service worker ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator))
      return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => console.log("SW registered:", reg.scope))
      .catch((err) => console.warn("SW failed:", err));
  }, []);

  // ── Capture install prompt ───────────────────────────────────────────────
  useEffect(() => {
    // Don't show if already dismissed recently
    const dismissed = localStorage.getItem("pwa_install_dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 86400000) return;

    const handler = (e: Event) => {
      console.log("[PWA] beforeinstallprompt fired");
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      // Wait 4 seconds before showing — Chrome requires engagement
      setTimeout(() => setShowInstall(true), 4000);
    };
    
    window.addEventListener("beforeinstallprompt", handler);
    
    // Log if PWA criteria not met
    window.addEventListener("appinstalled", () => {
      console.log("[PWA] App installed!");
      setInstallDone(true);
      setShowInstall(false);
    });
    
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ── Check notification status ────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const notifDismissed = localStorage.getItem("notif_dismissed");
    if (notifDismissed) return;
    if (Notification.permission === "granted") return;
    // Show notif banner after 8 seconds
    setTimeout(() => setShowNotif(true), 8000);
  }, []);

  // ── Handle install ───────────────────────────────────────────────────────
  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallDone(true);
    setShowInstall(false);
    if (outcome === "dismissed") {
      localStorage.setItem("pwa_install_dismissed", Date.now().toString());
    }
    setInstallEvent(null);
  };

  const dismissInstall = () => {
    setShowInstall(false);
    setInstallDone(true);
    localStorage.setItem("pwa_install_dismissed", Date.now().toString());
  };

  // ── Handle notifications ─────────────────────────────────────────────────
  const handleEnableNotif = async () => {
    setNotifDone(true);
    setShowNotif(false);
    if (!("Notification" in window)) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      if (!VAPID_KEY) {
        console.warn("No VAPID key configured");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
      });
      await savePushToken(JSON.stringify(sub));
    } catch (err) {
      console.warn("Push subscription failed:", err);
    }
  };

  const dismissNotif = () => {
    setShowNotif(false);
    setNotifDone(true);
    localStorage.setItem("notif_dismissed", "1");
  };

  // Nothing to show
  if ((!showInstall || installDone) && (!showNotif || notifDone)) return null;

  return (
    <div
      className="fixed z-[9999] space-y-2"
      style={{ bottom: "1rem", left: "1rem", right: "1rem" }}
    >
      {/* ── Install banner ─────────────────────────────────────────────── */}
      {showInstall && !installDone && (
        <div
          style={{
            background: "rgba(15,23,42,0.98)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "16px",
            padding: "16px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              flexShrink: 0,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2v14m0 0l-4-4m4 4l4-4"
                stroke="#34d399"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                stroke="#34d399"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                color: "#fff",
                fontWeight: "700",
                fontSize: "14px",
                margin: 0,
              }}
            >
              Add to Home Screen
            </p>
            <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>
              Install OmniTask Pro for faster access and offline support.
            </p>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                onClick={handleInstall}
                style={{
                  background: "#10b981",
                  color: "#030712",
                  fontWeight: "700",
                  fontSize: "12px",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Install
              </button>
              <button
                onClick={dismissInstall}
                style={{
                  background: "transparent",
                  color: "#64748b",
                  fontSize: "12px",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  cursor: "pointer",
                }}
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={dismissInstall}
            style={{
              background: "none",
              border: "none",
              color: "#475569",
              cursor: "pointer",
              padding: "4px",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Notification banner ────────────────────────────────────────── */}
      {showNotif && !notifDone && (
        <div
          style={{
            background: "rgba(15,23,42,0.98)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: "16px",
            padding: "16px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              flexShrink: 0,
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#60a5fa">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                color: "#fff",
                fontWeight: "700",
                fontSize: "14px",
                margin: 0,
              }}
            >
              Enable Notifications
            </p>
            <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>
              Get notified when tasks are approved, withdrawals are processed,
              and new tasks are available.
            </p>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                onClick={handleEnableNotif}
                style={{
                  background: "#3b82f6",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "12px",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Enable
              </button>
              <button
                onClick={dismissNotif}
                style={{
                  background: "transparent",
                  color: "#64748b",
                  fontSize: "12px",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  cursor: "pointer",
                }}
              >
                Skip
              </button>
            </div>
          </div>
          <button
            onClick={dismissNotif}
            style={{
              background: "none",
              border: "none",
              color: "#475569",
              cursor: "pointer",
              padding: "4px",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
