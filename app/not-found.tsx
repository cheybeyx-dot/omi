import Link from "next/link";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#030712" }}
    >
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #ef4444/20, #dc2626/20)",
              border: "2px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <AlertCircle size={48} className="text-red-500" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-white">404</h1>
          <p className="text-2xl font-bold text-slate-100">Page Not Found</p>
          <p className="text-slate-400 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Check the URL
            and try again.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/dashboard"
            className="w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
            }}
          >
            <Home size={18} />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2"
            style={{
              borderColor: "rgba(255, 255, 255, 0.1)",
              color: "#cbd5e1",
            }}
          >
            <ArrowLeft size={18} />
            Go Home
          </Link>
        </div>

        {/* Help text */}
        <p className="text-xs text-slate-500 pt-4">
          If you believe this is an error, please{" "}
          <Link href="/dashboard/support" className="text-emerald-400 hover:underline">
            contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
