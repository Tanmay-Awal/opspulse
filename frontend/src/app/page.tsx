'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Terminal, Activity, AlertTriangle, CheckCircle, BarChart2 } from 'lucide-react';
import { analyticsApi, incidentsApi } from '@/lib/api';

export default function HomePage() {
  const [activeIncidents, setActiveIncidents] = useState<number | null>(null);
  const [slaRate, setSlaRate] = useState<number | null>(null);
  const [p1Count, setP1Count] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const incidentsResponse = await incidentsApi.getAll({ status: 'open' });
        setActiveIncidents(incidentsResponse.data?.length || 0);

        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const sla = await analyticsApi.getSLAMetrics(startDate, endDate);
        setSlaRate(sla.slaComplianceRate);
        setP1Count(sla.p1Count);
      } catch (error) {
        console.error('Failed to fetch home metrics', error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 animate-slide-up bg-transparent relative overflow-hidden">
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

        {/* Call to Action & Analytics - Brutalist */}
        <div className="mt-8 delay-400 flex flex-col md:flex-row gap-8 items-start">
          <Link
            href="/incidents"
            className="group inline-flex items-center gap-4 px-8 py-5 text-lg font-mono font-bold bg-white text-black rounded-none border-2 border-white hover:bg-black hover:text-white transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(204,255,0,0.8)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(204,255,0,0.8)]"
          >
            <span>ACCESS_DASHBOARD</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/analytics"
            className="group inline-flex items-center gap-4 px-8 py-5 text-lg font-mono font-bold bg-neutral-900 border-2 border-neutral-800 text-white rounded-none hover:border-white transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]"
          >
            <span>VIEW_ANALYTICS</span>
            <BarChart2 className="text-acid-green group-hover:scale-110 transition-transform" />
          </Link>
        </div>

      </div>

      {/* Brutalist Footer Analytics Ticker */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-800 bg-neutral-950/80 backdrop-blur-md z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap gap-x-8 gap-y-2 items-center text-xs font-mono uppercase tracking-widest text-neutral-400">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-blue-500" />
            <span>SYS_STATUS:</span>
            <span className="text-white">OPTIMAL</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-neutral-800"></div>

          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className={activeIncidents && activeIncidents > 0 ? 'text-signal-orange' : 'text-neutral-600'} />
            <span>OPEN_INCIDENTS:</span>
            <span className={activeIncidents && activeIncidents > 0 ? 'text-signal-orange font-bold' : 'text-neutral-500'}>
              {activeIncidents !== null ? activeIncidents : '---'}
            </span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-neutral-800"></div>

          <div className="flex items-center gap-2">
            <Terminal size={14} className={p1Count && p1Count > 0 ? 'text-deep-red' : 'text-neutral-600'} />
            <span>P1_CRITICAL (30D):</span>
            <span className={p1Count && p1Count > 0 ? 'text-deep-red font-bold' : 'text-neutral-500'}>
              {p1Count !== null ? p1Count : '---'}
            </span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-neutral-800"></div>

          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-acid-green" />
            <span>SLA_COMPLIANCE (30D):</span>
            <span className={slaRate && slaRate >= 95 ? 'text-acid-green font-bold' : (slaRate && slaRate >= 80 ? 'text-signal-orange' : 'text-deep-red')}>
              {slaRate !== null ? `${slaRate}%` : '---'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}