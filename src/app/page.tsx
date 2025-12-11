
import Link from 'next/link';
import { Store, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-black">
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-5xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight">
          Ovro <span className="text-blue-600">Cloud POS</span>
        </h1>
        <p className="text-xl text-zinc-500 dark:text-zinc-400">
          Advanced workshop management for the modern era.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Link
          href="/pos"
          className="group relative overflow-hidden bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:border-blue-500/50 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-32 bg-blue-500/5 blur-[100px] rounded-full group-hover:bg-blue-500/10 transition-colors" />

          <div className="relative z-10">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Store size={32} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Counter Interface</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              Fast, keyboard-optimized checkout for processing sales and managing workshop service.
            </p>
            <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
              Launch POS <ArrowRight size={18} className="ml-2" />
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard"
          className="group relative overflow-hidden bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-32 bg-purple-500/5 blur-[100px] rounded-full group-hover:bg-purple-500/10 transition-colors" />

          <div className="relative z-10">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <LayoutDashboard size={32} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Owner Dashboard</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              Track profits, expenses, and business health with detailed analytics and reports.
            </p>
            <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-1 transition-transform">
              View Analytics <ArrowRight size={18} className="ml-2" />
            </div>
          </div>
        </Link>
      </div>

      <footer className="mt-16 text-zinc-400 text-sm">
        Ovro Cloud POS v0.1.0 • Local Mode
      </footer>
    </main>
  );
}
