import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { RootProviders } from "./providers";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import RealtimeWrapper from "@/components/RealtimeWrapper";
import AppLogo from "@/components/AppLogo"; // ✅ ADDED

import "./globals.css";

// Fonts
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

// Viewport config
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#020817",
};

// Metadata
export const metadata: Metadata = {
  title: "OmniTask Pro — AI Contributor Network",
  description:
    "Verified AI data contributor platform. Complete structured AI training tasks and earn weekly rewards.",
  manifest: "/manifest.json",
  generator: "v0.app",

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OmniTask Pro",
  },

  // ✅ UPDATED ICONS (as instructed)
  icons: {
    icon: "/favicon.ico",
    apple: "/logo-main.png",
  },
};

// Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />

        <meta name="theme-color" content="#020817" />
        <meta name="mobile-web-app-capable" content="yes" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="OmniTask Pro" />
      </head>

      <body className="font-sans antialiased">
        {/* ✅ GLOBAL LOGO (ADDED) */}
        <div className="p-4">
          <AppLogo size={28} showText textSize="text-sm"/>
        </div>

        <RootProviders>
          <RealtimeWrapper>{children}</RealtimeWrapper>

          {/* ✅ Mobile Nav */}
          <MobileBottomNav />
        </RootProviders>

        <PWAInstallBanner />
        <Analytics />
      </body>
    </html>
  );
}
