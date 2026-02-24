'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { incidentsApi } from '@/lib/api';
import { Incident, AuditLogEntry } from '@/types/incident';
import {
    getPriorityColor,
    getStatusColor,
    formatPriority,
    formatStatus,
    formatDateTime,
    formatDate,
} from '@/lib/utils';
import { Terminal, Activity, ArrowLeft, ShieldAlert, Cpu, Database, Network, Code, Server, AlertOctagon, CheckSquare } from 'lucide-react';

export default function IncidentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const incidentId = params.id as string;

    const [incident, setIncident] = useState<Incident | null>(null);
    const [auditTrail, setAuditTrail] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showResolveForm, setShowResolveForm] = useState(false);
    const [resolveData, setResolveData] = useState({
        rootCauseCategory: '',
        resolutionNotes: '',
    });

    useEffect(() => {
        fetchIncident();
        fetchAuditTrail();
        // Poll every 5 seconds for real-time updates
        const interval = setInterval(() => {
            fetchIncident();
            fetchAuditTrail();
        }, 5000);
        return () => clearInterval(interval);
    }, [incidentId]);

    const fetchIncident = async () => {
        try {
            const data = await incidentsApi.getOne(incidentId);
            setIncident(data);
        } catch (error) {
            console.error('Failed to fetch incident:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAuditTrail = async () => {
        try {
            const data = await incidentsApi.getAuditTrail(incidentId);
            setAuditTrail(data);
        } catch (error) {
            console.error('Failed to fetch audit trail:', error);
        }
    };

    const handleAcknowledge = async () => {
        try {
            await incidentsApi.acknowledge(incidentId);
            fetchIncident();
            fetchAuditTrail();
        } catch (error) {
            console.error('Failed to acknowledge:', error);
            alert('Failed to acknowledge incident');
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await incidentsApi.updateStatus(incidentId, newStatus);
            fetchIncident();
            fetchAuditTrail();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        }
    };

    const handleResolve = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await incidentsApi.resolve(incidentId, resolveData);
            setShowResolveForm(false);
            setResolveData({ rootCauseCategory: '', resolutionNotes: '' });
            fetchIncident();
            fetchAuditTrail();
        } catch (error) {
            console.error('Failed to resolve:', error);
            alert('Failed to resolve incident');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex flex-col items-center justify-center font-mono text-neutral-500">
                <Terminal className="animate-pulse mb-4" size={32} />
                <p>FETCHING_INCIDENT_DATA...</p>
            </div>
        );
    }

    if (!incident) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center font-mono">
                <div className="text-center border border-neutral-800 bg-neutral-950 p-12">
                    <ShieldAlert className="text-deep-red mx-auto mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-white mb-4">ERR_NOT_FOUND</h2>
                    <Link href="/incidents" className="text-neutral-400 hover:text-white border-b border-neutral-600 hover:border-white transition-colors">
                        [RETURN_TO_SYSTEM]
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pb-16 font-sans">
            {/* Minimalist Neo-Terminal Header */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b-[1px] border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/incidents"
                            className="text-neutral-500 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                                    ID: {incident.id.substring(0, 8)}
                                </span>
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
                            </div>
                            <h1 className="text-2xl font-bold font-mono tracking-tight text-white line-clamp-1">
                                {incident.title}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="border-b border-neutral-800 bg-neutral-950/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-wrap gap-3">
                        {incident.status === 'open' && (
                            <button
                                onClick={handleAcknowledge}
                                className="px-6 py-2 bg-deep-red/10 text-deep-red border border-deep-red/50 text-xs font-mono uppercase tracking-widest hover:bg-deep-red hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(225,29,72,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                            >
                                [ACKNOWLEDGE]
                            </button>
                        )}
                        {incident.status === 'acknowledged' && (
                            <>
                                <button
                                    onClick={() => handleStatusChange('investigating')}
                                    className="px-6 py-2 bg-signal-orange/10 text-signal-orange border border-signal-orange/50 text-xs font-mono uppercase tracking-widest hover:bg-signal-orange hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,69,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                >
                                    [INVESTIGATE]
                                </button>
                                <button
                                    onClick={() => setShowResolveForm(true)}
                                    className="px-6 py-2 bg-acid-green/10 text-acid-green border border-acid-green/50 text-xs font-mono uppercase tracking-widest hover:bg-acid-green hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(204,255,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                >
                                    [RESOLVE]
                                </button>
                            </>
                        )}
                        {incident.status === 'investigating' && (
                            <button
                                onClick={() => setShowResolveForm(true)}
                                className="px-6 py-2 bg-acid-green/10 text-acid-green border border-acid-green/50 text-xs font-mono uppercase tracking-widest hover:bg-acid-green hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(204,255,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                            >
                                [RESOLVE]
                            </button>
                        )}
                        {incident.status === 'resolved' && (
                            <span className="px-6 py-2 bg-acid-green border border-acid-green text-black text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                                <CheckSquare size={14} /> SYSTEM_RESTORED
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Resolve Form */}
                        {showResolveForm && (
                            <div className="bg-neutral-900 border border-acid-green/50 p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 border-b border-l border-acid-green/20 bg-black text-acid-green font-mono text-[10px] tracking-widest">
                                    // RESOLUTION_PROTOCOL
                                </div>
                                <h2 className="text-xl font-bold font-mono text-white mb-6">
                                    EXECUTE_RESOLUTION
                                </h2>
                                <form onSubmit={handleResolve} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase tracking-wide">
                                            Root_Cause_Category
                                        </label>
                                        <select
                                            value={resolveData.rootCauseCategory}
                                            onChange={(e) =>
                                                setResolveData({ ...resolveData, rootCauseCategory: e.target.value })
                                            }
                                            className="w-full px-4 py-3 bg-black border border-neutral-700 text-white font-mono text-sm focus:outline-none focus:border-acid-green focus:ring-1 focus:ring-acid-green transition-colors"
                                            required
                                        >
                                            <option value="">-- SELECT_CATEGORY --</option>
                                            <option value="database">DATABASE</option>
                                            <option value="network">NETWORK</option>
                                            <option value="third_party_api">THIRD_PARTY_API</option>
                                            <option value="code_bug">CODE_BUG</option>
                                            <option value="configuration">CONFIGURATION</option>
                                            <option value="infrastructure">INFRASTRUCTURE</option>
                                            <option value="security">SECURITY</option>
                                            <option value="resource_exhaustion">RESOURCE_EXHAUSTION</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase tracking-wide">
                                            Resolution_Notes
                                        </label>
                                        <textarea
                                            value={resolveData.resolutionNotes}
                                            onChange={(e) =>
                                                setResolveData({ ...resolveData, resolutionNotes: e.target.value })
                                            }
                                            rows={5}
                                            className="w-full px-4 py-3 bg-black border border-neutral-700 text-white font-mono text-sm focus:outline-none focus:border-acid-green focus:ring-1 focus:ring-acid-green transition-colors resize-y"
                                            placeholder="> Enter resolution summary..."
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <button
                                            type="submit"
                                            className="px-8 py-3 bg-acid-green text-black font-mono text-sm uppercase tracking-widest font-bold hover:bg-white transition-colors"
                                        >
                                            SUBMIT_REPORT
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowResolveForm(false)}
                                            className="px-8 py-3 bg-transparent border border-neutral-600 text-neutral-400 font-mono text-sm uppercase tracking-widest hover:bg-neutral-800 hover:text-white transition-colors"
                                        >
                                            ABORT
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Incident Details */}
                        <div className="bg-neutral-950 border border-neutral-800 p-6 relative">
                            <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-widest mb-6 border-b border-neutral-800 pb-2 flex justify-between">
                                <span>Triage_Data</span>
                                <span>{formatDateTime(incident.createdAt)}</span>
                            </h2>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                                <div>
                                    <dt className="text-xs font-mono text-neutral-500 mb-1 flex items-center gap-2">
                                        <Server size={14} /> SOURCE_SYSTEM
                                    </dt>
                                    <dd className="text-sm font-mono text-white bg-neutral-900 border border-neutral-800 px-3 py-2">
                                        {incident.source}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-mono text-neutral-500 mb-1 flex items-center gap-2">
                                        <AlertOctagon size={14} /> EVENT_TYPE
                                    </dt>
                                    <dd className="text-sm font-mono text-white bg-neutral-900 border border-neutral-800 px-3 py-2">
                                        {incident.eventType.replace(/_/g, ' ').toUpperCase()}
                                    </dd>
                                </div>

                                {incident.acknowledgedAt && (
                                    <div>
                                        <dt className="text-xs font-mono text-neutral-500 mb-1">ACKNOWLEDGED_AT</dt>
                                        <dd className="text-sm font-mono text-white bg-neutral-900 border border-neutral-800 border-l-blue-500 px-3 py-2">
                                            {formatDateTime(incident.acknowledgedAt)}
                                        </dd>
                                    </div>
                                )}
                                {incident.resolvedAt && (
                                    <div>
                                        <dt className="text-xs font-mono text-neutral-500 mb-1">RESOLVED_AT</dt>
                                        <dd className="text-sm font-mono text-white bg-neutral-900 border border-neutral-800 border-l-acid-green px-3 py-2">
                                            {formatDateTime(incident.resolvedAt)}
                                        </dd>
                                    </div>
                                )}

                                {incident.rootCauseCategory && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-xs font-mono text-neutral-500 mb-1 flex items-center gap-2">
                                            {getRootCauseIcon(incident.rootCauseCategory)} ROOT_CAUSE
                                        </dt>
                                        <dd className="text-sm font-mono text-white bg-neutral-900 border border-neutral-800 border-l-acid-green px-3 py-2">
                                            {incident.rootCauseCategory.replace(/_/g, ' ').toUpperCase()}
                                        </dd>
                                    </div>
                                )}
                                {incident.resolutionNotes && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-xs font-mono text-neutral-500 mb-1">RESOLUTION_NOTES</dt>
                                        <dd className="text-sm font-mono text-neutral-300 bg-neutral-900 border border-neutral-800 border-l-acid-green px-4 py-3 whitespace-pre-wrap leading-relaxed">
                                            {incident.resolutionNotes}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Timeline */}
                        <div className="bg-neutral-950 border border-neutral-800 p-6">
                            <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-widest mb-6 border-b border-neutral-800 pb-2">
                                System_Log ({auditTrail.length}_records)
                            </h2>
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {auditTrail.map((entry, idx) => (
                                        <li key={entry.id}>
                                            <div className="relative pb-8">
                                                {idx !== auditTrail.length - 1 && (
                                                    <span
                                                        className="absolute top-4 left-[15px] -ml-px h-full w-[2px] bg-neutral-800"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <div className="relative flex items-start space-x-4">
                                                    <div>
                                                        <span className={`h-8 w-8 rounded-none border border-current flex items-center justify-center bg-black ${getActionColor(entry.action)}`}>
                                                            <span className="text-[10px]">
                                                                {getActionIcon(entry.action)}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 bg-neutral-900/50 border border-neutral-800 p-3 mt-1">
                                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-2 mb-1">
                                                            <p className="text-sm font-mono text-white uppercase tracking-wider">
                                                                {formatAction(entry.action)}
                                                            </p>
                                                            <div className="whitespace-nowrap text-xs font-mono text-neutral-500">
                                                                {formatDateTime(entry.timestamp)}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs font-mono text-neutral-400">
                                                            USER: {entry.actorEmail}
                                                        </p>
                                                        {entry.toValue && (
                                                            <div className="mt-3 bg-black border border-neutral-800 p-2 overflow-x-auto">
                                                                <pre className="text-[10px] sm:text-xs font-mono text-neutral-500 uppercase">
                                                                    {JSON.stringify(entry.toValue, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Metadata */}
                    <div className="space-y-6">
                        <div className="bg-neutral-950 border border-neutral-800 p-6 sticky top-24">
                            <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-widest mb-6 border-b border-neutral-800 pb-2 flex items-center gap-2">
                                <Cpu size={14} /> META_DATA
                            </h2>
                            <dl className="space-y-4">
                                <div className="bg-neutral-900 p-3 border border-neutral-800">
                                    <dt className="text-[10px] font-mono text-neutral-500 mb-1">
                                        ESCALATION_LEVEL
                                    </dt>
                                    <dd className="text-lg font-mono text-white flex items-center gap-2">
                                        <span className="text-signal-orange">Lvl_{incident.escalationLevel}</span>
                                    </dd>
                                </div>
                                <div className="bg-neutral-900 p-3 border border-neutral-800">
                                    <dt className="text-[10px] font-mono text-neutral-500 mb-1">
                                        EVENT_MULTIPLIER
                                    </dt>
                                    <dd className="text-lg font-mono text-white">
                                        x{incident.eventCount}
                                    </dd>
                                </div>
                                <div className="bg-neutral-900 p-3 border border-neutral-800">
                                    <dt className="text-[10px] font-mono text-neutral-500 mb-1">
                                        ORG_WORKSPACE
                                    </dt>
                                    <dd className="text-sm font-mono text-white truncate" title={incident.organization.name}>
                                        {incident.organization.name}
                                    </dd>
                                </div>
                            </dl>

                            {incident.metadata && Object.keys(incident.metadata).length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-[10px] font-mono text-neutral-500 uppercase mb-2">
                                        // RAW_PAYLOAD
                                    </h3>
                                    <div className="bg-black border border-neutral-800 p-3 overflow-auto max-h-64">
                                        <pre className="text-[10px] font-mono text-neutral-400">
                                            {JSON.stringify(incident.metadata, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getRootCauseIcon(category: string) {
    switch (category) {
        case 'database': return <Database size={14} />;
        case 'network': return <Network size={14} />;
        case 'code_bug': return <Code size={14} />;
        case 'infrastructure': return <Server size={14} />;
        case 'security': return <ShieldAlert size={14} />;
        default: return <Cpu size={14} />;
    }
}

function getActionColor(action: string): string {
    if (action.includes('created')) return 'text-deep-red border-deep-red';
    if (action.includes('acknowledged')) return 'text-blue-500 border-blue-500';
    if (action.includes('resolved')) return 'text-acid-green border-acid-green';
    if (action.includes('escalated')) return 'text-signal-orange border-signal-orange';
    return 'text-neutral-500 border-neutral-500';
}

function getActionIcon(action: string): string {
    const icons: Record<string, string> = {
        incident_created: 'SYS',
        incident_acknowledged: 'ACK',
        incident_escalated: 'UP',
        incident_resolved: 'OK',
        incident_status_changed: 'MOD',
    };
    return icons[action] || 'LOG';
}

function formatAction(action: string): string {
    return action.toUpperCase();
}