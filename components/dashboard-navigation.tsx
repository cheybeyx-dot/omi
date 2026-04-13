"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Zap,
  DollarSign,
  Users,
  BookOpen,
  Settings,
  Shield,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "GPU Plans", href: "/dashboard/gpu-plans", icon: LayoutGrid },
  { label: "Tasks", href: "/dashboard/tasks", icon: Zap },
  { label: "Financials", href: "/dashboard/financials", icon: DollarSign },
  { label: "Network", href: "/dashboard/network", icon: Users },
  { label: "Academy", href: "/dashboard/academy", icon: BookOpen },
  { label: "Verification", href: "/dashboard/verification", icon: Shield },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

// Matches dashboard palette
const BG = "#040812";
const BORDER = "#0e1d38";
const ACTIVE_BG = "#0a1f3d";
const ACTIVE_COLOR = "#10b981";
const TEXT = "#334155";
const TEXT_HI = "#94a3b8";

export default function DashboardNavigation() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="hidden md:flex flex-col min-h-screen transition-all duration-300 shrink-0"
      style={{
        width: collapsed ? 60 : 216,
        background: BG,
        borderRight: `1px solid ${BORDER}`,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-between px-4 py-5"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "#10b98118", border: "1px solid #10b98130" }}
            >
              <span
                className="text-[10px] font-black"
                style={{ color: "#10b981" }}
              >
                O
              </span>
            </div>
            <span className="font-black text-sm" style={{ color: "#e2e8f0" }}>
              OmniTask
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 transition-colors ml-auto"
          style={{ color: TEXT }}
          onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_HI)}
          onMouseLeave={(e) => (e.currentTarget.style.color = TEXT)}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: active ? ACTIVE_BG : "transparent",
                color: active ? ACTIVE_COLOR : TEXT,
                border: active
                  ? `1px solid #10b98118`
                  : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "#0a1626";
                  e.currentTarget.style.color = TEXT_HI;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = TEXT;
                }
              }}
            >
              <Icon size={15} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-4" style={{ borderTop: `1px solid ${BORDER}` }}>
          <p className="text-[9px] font-mono" style={{ color: "#1e3a5f" }}>
            OmniTask Pro v1.0
          </p>
        </div>
      )}
    </aside>
  );
}
