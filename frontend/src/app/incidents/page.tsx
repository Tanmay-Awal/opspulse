'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { incidentsApi, analyticsApi } from '@/lib/api';
import { Incident } from '@/types/incident';
import {
    getPriorityColor,
    getStatusColor,
    formatPriority,
    formatStatus,
    formatDate,
} from '@/lib/utils';
import { Terminal, Activity, ArrowLeft, Filter, AlertTriangle, ShieldAlert, Award, Search, MoreVertical, CheckCircle, Sparkles, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'open' | 'acknowledged' | 'resolved'>('all');
    const [slaRate, setSlaRate] = useState<number | null>(null);
    const [p1Count, setP1Count] = useState<number | null>(null);

    useEffect(() => {
        fetchIncidents();
        const interval = setInterval(fetchIncidents, 5000);
        return () => clearInterval(interval);
    }, [filter]);

    const fetchIncidents = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            const data = await incidentsApi.getAll(params);
            setIncidents(data.data || []);

            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const sla = await analyticsApi.getSLAMetrics(startDate, endDate);
            setSlaRate(sla.slaComplianceRate);
            setP1Count(sla.p1Count);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await incidentsApi.acknowledge(id);
            toast.success('Incident acknowledged');
            fetchIncidents();
        } catch (error: any) {
            console.error('Failed to acknowledge:', error);
            toast.error(error?.response?.data?.message || 'Failed to acknowledge incident');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center font-sans text-slate-500 relative">
                <Activity className="animate-spin text-purple-600 mb-4" size={32} />
                <p className="font-medium text-slate-400 z-10">Initializing Neural Feed...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-16 font-sans relative">

            {/* Premium Glassmorphism Header */}
            <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl cursor-pointer">
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 drop-shadow-md">
                                    Incident Command
                                </h1>
                                <p className="text-sm text-slate-400 mt-0.5 font-medium">
                                    Tracking {incidents.length} active anomalies
                                </p>
                            </div>
                        </div>

                        {/* Modern Glass Filters & Nav */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-md overflow-x-auto max-w-full custom-scrollbar">
                                {(['all', 'open', 'acknowledged', 'resolved'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-4 py-1.5 text-sm font-semibold capitalize rounded-lg transition-all duration-300 whitespace-nowrap ${filter === status
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                            <Link href="/analytics" className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm rounded-xl transition-all flex items-center gap-2 group whitespace-nowrap">
                                <BarChart2 size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
                                <span className="hidden sm:inline">Analytics</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Micro-Analytics Bar */}
            <div className="border-b border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-6 text-sm font-medium text-slate-400">
                    <div className="flex items-center gap-2 group cursor-default">
                        <Award size={16} className={slaRate && slaRate >= 95 ? 'text-indigo-400 group-hover:scale-110 transition-transform' : 'text-slate-500'} />
                        <span>30D SLA Target:</span>
                        <span className={`font-bold ${slaRate && slaRate >= 95 ? 'text-white' : 'text-slate-300'}`}>
                            {slaRate !== null ? `${slaRate}%` : '---'}
                        </span>
                    </div>
                    <div className="w-px h-5 bg-white/10" />
                    <div className="flex items-center gap-2 group cursor-default">
                        <ShieldAlert size={16} className={p1Count && p1Count > 0 ? 'text-orange-400 group-hover:scale-110 transition-transform' : 'text-slate-500'} />
                        <span>30D Level-1 Extinctions:</span>
                        <span className={`font-bold ${p1Count && p1Count > 0 ? 'text-white' : 'text-slate-300'}`}>
                            {p1Count !== null ? p1Count : '---'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Incidents Feed */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                {incidents.length === 0 ? (
                    <div className="glass-panel rounded-3xl p-16 text-center animate-slide-up overflow-hidden relative">
                        <div className="absolute inset-0 bg-emerald-500/10 blur-[50px] pointer-events-none"></div>
                        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">All Systems Nominal</h3>
                        <p className="text-slate-400 text-lg max-w-md mx-auto">
                            {filter !== 'all'
                                ? `No anomalies found matching the '${filter}' sector.`
                                : 'The grid is stable. No active anomalies detected across the infrastructure.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {incidents.map((incident, idx) => (
                            <Link href={`/incidents/${incident.id}`} key={incident.id} className="block group">
                                <div
                                    className="glass-panel glass-panel-hover p-5 md:p-6 rounded-2xl animate-slide-up relative overflow-hidden"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    {/* Neon Status Glow Edge */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 shadow-[0_0_10px_currentColor] ${incident.status === 'open' ? 'bg-red-500 text-red-500' : incident.status === 'acknowledged' ? 'bg-blue-500 text-blue-500' : 'bg-slate-500 text-slate-500'}`}></div>

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-4">
                                        <div className="flex-1 min-w-0">
                                            {/* Top Metadata Tags */}
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <span className="text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-md">
                                                    #{incident.id.substring(0, 8)}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold capitalize border backdrop-blur-md ${getModernPriorityColor(incident.priority)}`}
                                                >
                                                    {formatPriority(incident.priority)}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold capitalize border backdrop-blur-md ${getModernStatusColor(incident.status)}`}
                                                >
                                                    {formatStatus(incident.status)}
                                                </span>
                                                {incident.eventCount > 1 && (
                                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold bg-white/5 border border-white/10 text-slate-300 rounded-lg backdrop-blur-md">
                                                        {incident.eventCount} Events
                                                    </span>
                                                )}
                                                {/* AI Badge */}
                                                {(incident.status === 'open' || incident.status === 'acknowledged') && (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                                        <Sparkles size={12} className="mr-1" /> Core AI Ready
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-2 line-clamp-2 tracking-tight drop-shadow-sm">
                                                {incident.title}
                                            </h3>

                                            {/* Bottom Metadata */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400 font-medium">
                                                <span className="flex items-center gap-1.5">
                                                    <Activity size={14} className="text-indigo-400" /> {incident.source}
                                                </span>
                                                <span className="hidden sm:inline text-white/20">•</span>
                                                <span>{formatDate(incident.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Row Actions */}
                                        <div className="flex items-center gap-3 shrink-0 mt-4 md:mt-0">
                                            {incident.status === 'open' && (
                                                <button
                                                    onClick={(e) => handleAcknowledge(incident.id, e)}
                                                    className="px-5 py-2.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-sm rounded-xl hover:bg-indigo-500/40 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                                                >
                                                    Acknowledge
                                                </button>
                                            )}
                                            <div className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-xl group-hover:bg-white/15 transition-all shadow-sm">
                                                Deep Dive
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Glass UI Color Helpers
function getModernPriorityColor(priority: string) {
    if (priority.includes('p1')) return 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
    if (priority.includes('p2')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
    if (priority.includes('p3')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
}

function getModernStatusColor(status: string) {
    if (status === 'open') return 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
    if (status === 'acknowledged') return 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
    if (status === 'resolved') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
    if (status === 'closed') return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]';
}
