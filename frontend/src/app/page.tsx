import Link from 'next/link';
import { ArrowRight, Terminal } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 animate-slide-up bg-transparent relative">
      <div className="w-full max-w-7xl flex flex-col justify-center gap-8 relative z-10 my-auto">

        {/* Meta / Tagline */}
        <div className="flex items-center gap-3 font-mono text-sm uppercase tracking-widest text-neutral-500 mb-4 delay-100">
          <Terminal size={14} />
          <span>System Initialized</span>
          <span className="hidden sm:inline-block w-12 h-px bg-neutral-800"></span>
          <span className="text-acid-green animate-pulse-slow">● ONLINE</span>
        </div>

        {/* Huge Typographic Hero */}
        <h1 className="text-6xl sm:text-8xl md:text-[10rem] font-bold leading-[0.85] tracking-tighter text-white delay-200">
          OPS<span className="text-deep-red">\</span>PULSE
        </h1>

        <p className="text-lg md:text-2xl lg:text-3xl font-mono text-neutral-400 max-w-3xl border-l-2 border-deep-red pl-6 py-2 delay-300">
          Automated incident detection, default to action, triage, and
          escalation platform for elite SRE teams.
        </p>

        {/* Call to Action - Brutalist Button */}
        <div className="mt-8 delay-400">
          <Link
            href="/incidents"
            className="group inline-flex items-center gap-4 px-8 py-5 text-lg font-mono font-bold bg-white text-black rounded-none border-2 border-white hover:bg-black hover:text-white transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(204,255,0,0.8)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(204,255,0,0.8)]"
          >
            <span>ACCESS_DASHBOARD</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  );
}