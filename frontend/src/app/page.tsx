'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Terminal, Activity, AlertTriangle, CheckCircle, BarChart2, Bot, Bell, Zap, Database, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center relative overflow-x-hidden font-sans">

      {/* Premium Glass Navbar */}
      <nav className="w-full sticky top-0 z-50 glass-panel border-b-0 border-white/5 mx-auto mt-4 max-w-7xl rounded-full px-2 py-1 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="px-4 h-12 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]">
              <Activity size={18} />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">OpsPulse</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/analytics" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-300 group px-3 py-2 rounded-xl hover:bg-white/10">
              <BarChart2 size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Analytics</span>
            </Link>
            <Link href="/incidents" className="text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full transition-all duration-300 border border-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              Enter Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-32 flex flex-col gap-24 relative z-10">

        {/* Supreme Hero Section */}
        <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto animate-slide-up relative">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-sm font-medium backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Sparkles size={14} className="text-indigo-400 animate-pulse" />
            <span>AI-Driven Incident Command Center</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-[5rem] font-extrabold tracking-tight leading-[1.1] text-white">
            Resolve downtime <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 animate-pulse-glow inline-block">faster</span> than humanly possible.
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
            Neural-net detection, absolute automated triage, AI-synthesized remediation paths, and zero-compromise analytics for elite engineering teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 mt-6 w-full justify-center items-center">
            <Link
              href="/incidents"
              className="group relative inline-flex justify-center items-center gap-2 px-8 py-4 text-base font-semibold bg-white text-black rounded-full hover:scale-105 transition-all duration-300 overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent translate-x-[-150%] skew-x-[-15deg]" />
              <span className="relative">Command Center</span>
              <ArrowRight size={18} className="relative group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/analytics"
              className="group inline-flex justify-center items-center gap-2 px-8 py-4 text-base font-semibold glass-panel text-white rounded-full hover:bg-white/10 transition-all duration-300"
            >
              <BarChart2 size={18} className="text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
              <span>Platform Analytics</span>
            </Link>
          </div>
        </div>

        {/* Floating Glass Metrics Ticker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up delay-100">
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-[40px] group-hover:bg-emerald-500/30 transition-colors"></div>
            <div className="flex items-center gap-3 text-slate-300 font-medium text-sm z-10">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <Activity size={16} />
              </div>
              System Core
            </div>
            <div className="text-3xl font-bold text-white z-10 tracking-tight">Optimal</div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden group">
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[40px] transition-colors ${activeIncidents && activeIncidents > 0 ? 'bg-red-500/20 group-hover:bg-red-500/30' : 'bg-blue-500/10'}`}></div>
            <div className="flex items-center gap-3 text-slate-300 font-medium text-sm z-10">
              <div className={`p-2 rounded-lg border shadow-[0_0_10px_rgba(239,68,68,0.2)] ${activeIncidents && activeIncidents > 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                <AlertTriangle size={16} />
              </div>
              Active Incidents
            </div>
            <div className={`text-3xl font-bold z-10 tracking-tight ${activeIncidents && activeIncidents > 0 ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-white'}`}>
              {activeIncidents !== null ? activeIncidents : '---'}
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden group">
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[40px] transition-colors ${p1Count && p1Count > 0 ? 'bg-orange-500/20 group-hover:bg-orange-500/30' : 'bg-slate-500/10'}`}></div>
            <div className="flex items-center gap-3 text-slate-300 font-medium text-sm z-10">
              <div className={`p-2 rounded-lg border shadow-[0_0_10px_rgba(249,115,22,0.2)] ${p1Count && p1Count > 0 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                <ShieldAlert size={16} />
              </div>
              P1 Criticals <span className="text-slate-500 text-xs">(30D)</span>
            </div>
            <div className={`text-3xl font-bold z-10 tracking-tight ${p1Count && p1Count > 0 ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'text-white'}`}>
              {p1Count !== null ? p1Count : '---'}
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] group-hover:bg-indigo-500/30 transition-colors"></div>
            <div className="flex items-center gap-3 text-slate-300 font-medium text-sm z-10">
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                <CheckCircle size={16} />
              </div>
              SLA Adherence
            </div>
            <div className={`text-3xl font-bold z-10 tracking-tight ${slaRate && slaRate >= 95 ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-white'}`}>
              {slaRate !== null ? `${slaRate}%` : '---'}
            </div>
          </div>
        </div>

        {/* Feature Grid - Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up delay-200">
          <div className="glass-panel glass-panel-hover p-8 rounded-3xl group flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] group-hover:scale-110 transition-transform duration-300">
              <Bot size={28} />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-tight text-xl mb-3 group-hover:text-purple-300 transition-colors">Cognitive Auto-Remediation</h3>
              <p className="text-slate-400 mb-4 leading-relaxed">
                Our AI instantly ingests context from triggered alarms, analyzes root causes, and proposes safe, executable code runs with seamless one-click oversight.
              </p>
            </div>
          </div>

          <div className="glass-panel glass-panel-hover p-8 rounded-3xl group flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] group-hover:scale-110 transition-transform duration-300">
              <Bell size={28} />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-tight text-xl mb-3 group-hover:text-pink-300 transition-colors">Omni-Channel Synthesis</h3>
              <p className="text-slate-400 mb-4 leading-relaxed">
                Intelligent routing across Slack, SMS, and Email. Suppresses duplicate noise automatically, ensuring you only get alerted for what truly matters.
              </p>
            </div>
          </div>

          <div className="glass-panel glass-panel-hover p-8 rounded-3xl group flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:scale-110 transition-transform duration-300">
              <Zap size={28} />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-tight text-xl mb-3 group-hover:text-orange-300 transition-colors">Dynamic Escalations</h3>
              <p className="text-slate-400 mb-4 leading-relaxed">
                Never miss an SLA. Smart, programmable tracking ensures automatically tiered escalations to backup engineers if primary responders are occupied.
              </p>
            </div>
          </div>

          <div className="glass-panel glass-panel-hover p-8 rounded-3xl group flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(52,211,153,0.3)] group-hover:scale-110 transition-transform duration-300">
              <BarChart2 size={28} />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-tight text-xl mb-3 group-hover:text-emerald-300 transition-colors">Crystal-Clear Analytics</h3>
              <p className="text-slate-400 mb-4 leading-relaxed">
                Break down team execution times, perform historic root cause analyses, and generate comprehensive PDF/CSV management reports on-demand.
              </p>
            </div>
          </div>
        </div>

        {/* Cinematic Platform Banner */}
        <div className="relative overflow-hidden rounded-3xl group animate-slide-up delay-300 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 group-hover:border-white/20 transition-all z-10" />
          <div className="absolute -right-20 -top-20 opacity-20 text-blue-400 blur-sm pointer-events-none z-0">
            <Database size={400} />
          </div>
          <div className="relative z-20 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex flex-col gap-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider w-fit shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                Enterprise Caliber Architecture
              </div>
              <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
                Built to Scale Limitlessly.
              </h3>
              <p className="text-slate-300 text-lg md:text-xl font-medium">
                Engineered with pure Next.js perfection, NestJS, scalable PostgreSQL clusters, Prisma, and native OpenAI integrations. Reliability at your fingertips.
              </p>
            </div>
            <Link
              href="/incidents"
              className="shrink-0 relative group overflow-hidden px-8 py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center gap-2"
            >
              <span>Initialize Workspace</span>
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}