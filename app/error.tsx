'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('[ERROR_BOUNDARY]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#030712' }}>
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #ef4444/20, #dc2626/20)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertCircle size={40} className="text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
          <p className="text-slate-400 text-sm">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-left">
          <p className="text-xs text-slate-500 font-mono break-words">
            {error?.digest || 'Error ID: Unknown'}
          </p>
        </div>

        <button
          onClick={reset}
          className="w-full py-3 rounded-xl font-bold text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
          }}
        >
          Try Again
        </button>

        <a
          href="/dashboard"
          className="block text-center text-emerald-400 hover:underline text-sm"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
