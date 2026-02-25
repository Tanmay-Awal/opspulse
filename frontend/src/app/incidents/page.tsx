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
import { Terminal, Activity, ArrowLeft, Filter, AlertTriangle, ShieldAlert, Award } from 'lucide-react';

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'open' | 'acknowledged' | 'resolved'>('all');
    const [slaRate, setSlaRate] = useState<number | null>(null);
    const [p1Count, setP1Count] = useState<number | null>(null);

    useEffect(() => {
        fetchIncidents();
        // Poll every 5 seconds for real-time updates
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

    const handleAcknowledge = async (id: string) => {
        try {
            await incidentsApi.acknowledge(id);
            fetchIncidents(); // Refresh list
        } catch (error) {
            console.error('Failed to acknowledge:', error);
            alert('Failed to acknowledge incident');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex flex-col items-center justify-center font-mono text-neutral-500">
                <Terminal className="animate-pulse mb-4" size={32} />
                <p>INITIALIZING_SYSTEM_DATA...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pb-16 font-sans">
            {/* Minimalist Neo-Terminal Header */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b-[1px] border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="text-neutral-500 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
                                    <Activity className="text-signal-orange" size={20} />
                                    ACTIVE_INCIDENTS
                                </h1>
                                <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest mt-1">
                                    Status: {incidents.length} logs found
                                </p>
                            </div>
                        </div>

                        {/* Brutalist Filters */}
                        <div className="flex bg-neutral-900 border border-neutral-800 p-1">
                            <div className="hidden sm:flex items-center px-3 text-neutral-500">
                                <Filter size={14} />
                            </div>
                            {(['all', 'open', 'acknowledged', 'resolved'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-200 ${filter === status
                                        ? 'bg-deep-red text-white shadow-[2px_2px_0px_0px_rgba(225,29,72,0.5)]'
                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Analytics Bar */}
            <div className="border-b border-neutral-800 bg-neutral-950/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-6 text-xs font-mono uppercase tracking-widest text-neutral-400">
                    <div className="flex items-center gap-2">
                        <Award size={14} className={slaRate && slaRate >= 95 ? 'text-acid-green' : 'text-neutral-500'} />
                        <span>30D_SLA_RATE:</span>
                        <span className={slaRate && slaRate >= 95 ? 'text-white' : 'text-neutral-500'}>
                            {slaRate !== null ? `${slaRate}%` : '---'}
                        </span>
                    </div>
                    <div className="w-px h-4 bg-neutral-800" />
                    <div className="flex items-center gap-2">
                        <ShieldAlert size={14} className={p1Count && p1Count > 0 ? 'text-deep-red' : 'text-neutral-500'} />
                        <span>30D_P1_CRITS:</span>
                        <span className={p1Count && p1Count > 0 ? 'text-white' : 'text-neutral-500'}>
                            {p1Count !== null ? p1Count : '---'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Incidents List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {incidents.length === 0 ? (
                    <div className="border border-neutral-800 bg-neutral-950 p-12 text-center animate-slide-up">
                        <AlertTriangle className="text-neutral-700 mx-auto mb-4" size={48} />
                        <h3 className="text-lg font-mono text-white mb-2">NO_INCIDENTS_DETECTED</h3>
                        <p className="text-sm font-mono text-neutral-500 uppercase">
                            {filter !== 'all'
                                ? `System clear for [${filter}] status.`
                                : 'All systems operating within normal parameters.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {incidents.map((incident, idx) => (
                            <div
                                key={incident.id}
                                className={`group bg-neutral-950/50 border border-neutral-800 hover:border-neutral-600 transition-colors p-4 md:p-6 animate-slide-up hover:bg-black relative overflow-hidden`}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {/* Active Indicator Bar */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${incident.status === 'open' ? 'bg-deep-red' : incident.status === 'acknowledged' ? 'bg-blue-500' : 'bg-neutral-800'}`}></div>

                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pl-3">
                                    <div className="flex-1 min-w-0">
                                        {/* Priority and Status Badges */}
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border ${getPriorityColor(
                                                    incident.priority
                                                )}`}
                                            >
                                                {formatPriority(incident.priority)}
                                            </span>
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border ${getStatusColor(
                                                    incident.status
                                                )}`}
                                            >
                                                {formatStatus(incident.status)}
                                            </span>
                                            {incident.eventCount > 1 && (
                                                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border border-neutral-700 text-neutral-400 bg-neutral-900">
                                                    {incident.eventCount} MULTIPLE_EVENTS
                                                </span>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <Link href={`/incidents/${incident.id}`}>
                                            <h3 className="text-xl font-semibold text-white group-hover:text-acid-green transition-colors mb-2 line-clamp-2">
                                                {incident.title}
                                            </h3>
                                        </Link>

                                        {/* Metadata */}
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-neutral-500 uppercase">
                                            <span className="text-neutral-400">ID:{incident.id.substring(0, 8)}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span>T-{formatDate(incident.createdAt)}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span className="text-signal-orange/80">SRC:{incident.source}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 shrink-0 mt-2 md:mt-0">
                                        {incident.status === 'open' && (
                                            <button
                                                onClick={() => handleAcknowledge(incident.id)}
                                                className="px-4 py-2 bg-deep-red/10 text-deep-red border border-deep-red/50 text-xs font-mono uppercase tracking-widest hover:bg-deep-red hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(225,29,72,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                            >
                                                [ACKNOWLEDGE]
                                            </button>
                                        )}
                                        <Link
                                            href={`/incidents/${incident.id}`}
                                            className="px-4 py-2 bg-transparent text-white border border-neutral-700 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                                        >
                                            View_Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}