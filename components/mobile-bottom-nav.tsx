"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Zap,
  DollarSign,
  LayoutGrid,
  MoreHorizontal,
  Users,
  BookOpen,
  Shield,
  Settings,
  X,
  BadgeCheck,
  Code2,
  FileText,
  HelpCircle,
  Receipt,
} from "lucide-react";
import { useState } from "react";

const PRIMARY_NAV = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "GPU Plans", href: "/dashboard/gpu-plans", icon: LayoutGrid },
  { label: "Tasks", href: "/dashboard/tasks", icon: Zap },
  { label: "Finance", href: "/dashboard/financials", icon: DollarSign },
];

const MORE_SECTIONS = [
  {
    title: "Identity & Access",
    items: [
      {
        label: "Contributor ID",
        href: "/dashboard/contributor-id",
        icon: BadgeCheck,
      },
      { label: "Verification", href: "/dashboard/verification", icon: Shield },
      { label: "API Access", href: "/dashboard/api-access", icon: Code2 },
    ],
  },
  {
    title: "Finance & Legal",
    items: [
      { label: "Tax Report", href: "/dashboard/tax", icon: Receipt },
      { label: "License", href: "/dashboard/license", icon: FileText },
      { label: "Academy", href: "/dashboard/academy", icon: BookOpen },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Network", href: "/dashboard/network", icon: Users },
      { label: "Support", href: "/dashboard/support", icon: HelpCircle },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

const ALL_MORE_HREFS = MORE_SECTIONS.flatMap((s) => s.items.map((i) => i.href));

const HIDDEN_ON = ["/dashboard/checkout", "/auth"];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const shouldHide =
    !pathname.startsWith("/dashboard") ||
    HIDDEN_ON.some((p) => pathname.startsWith(p));

  if (shouldHide) return null;

  const isMoreActive = ALL_MORE_HREFS.some((href) => pathname.startsWith(href));

  return (
    <>
      {/* Backdrop — sits below the drawer but above page content */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More drawer — NO backdrop-blur on the container itself */}
      {moreOpen && (
        <div
          className="fixed left-2 right-2 z-50 md:hidden rounded-2xl overflow-hidden"
          style={{
            bottom: "calc(64px + env(safe-area-inset-bottom))",
            backgroundColor: "rgb(10, 16, 30)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              More
            </span>
            <button
              onClick={() => setMoreOpen(false)}
              className="text-slate-500 hover:text-white transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>

          {/* Sections — overflow-y-auto here, NOT on the parent */}
          <div
            className="p-3 space-y-4 overflow-y-auto"
            style={{ maxHeight: "65vh" }}
          >
            {MORE_SECTIONS.map(({ title, items }) => (
              <div key={title}>
                <p
                  className="text-[9px] font-bold uppercase tracking-widest px-1 mb-2"
                  style={{ color: "rgba(100,116,139,0.8)" }}
                >
                  {title}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {items.map(({ label, href, icon: Icon }) => {
                    const active = pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMoreOpen(false)}
                        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all"
                        style={{
                          backgroundColor: active
                            ? "rgba(52,211,153,0.08)"
                            : "rgba(30,41,59,0.7)",
                          border: active
                            ? "1px solid rgba(52,211,153,0.2)"
                            : "1px solid transparent",
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: active
                              ? "rgba(52,211,153,0.12)"
                              : "rgba(51,65,85,0.6)",
                          }}
                        >
                          <Icon
                            size={17}
                            className={
                              active ? "text-emerald-400" : "text-slate-400"
                            }
                          />
                        </div>
                        <span
                          className="text-[10px] font-medium text-center leading-tight"
                          style={{
                            color: active
                              ? "rgb(52,211,153)"
                              : "rgb(148,163,184)",
                          }}
                        >
                          {label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        style={{
          backgroundColor: "rgb(12, 18, 32)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center justify-around h-16">
          {PRIMARY_NAV.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={active ? "text-emerald-400" : "text-slate-500"}
                  />
                  {active && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium leading-none ${
                    active ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
          >
            <div className="relative flex items-center justify-center">
              <MoreHorizontal
                size={22}
                strokeWidth={isMoreActive || moreOpen ? 2.5 : 1.8}
                className={
                  isMoreActive || moreOpen
                    ? "text-emerald-400"
                    : "text-slate-500"
                }
              />
              {(isMoreActive || moreOpen) && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
              )}
            </div>
            <span
              className={`text-[10px] font-medium leading-none ${
                isMoreActive || moreOpen ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
