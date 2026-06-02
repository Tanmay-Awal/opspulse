'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { incidentsApi, remediationApi } from '@/lib/api';
import { Incident, AuditLogEntry } from '@/types/incident';
import {
    getPriorityColor,
    getStatusColor,
    formatPriority,
    formatStatus,
    formatDateTime,
} from '@/lib/utils';
import PlaybookForm from '@/components/PlaybookForm';
import {
    Terminal,
    ArrowLeft,
    ShieldAlert,
    Cpu,
    Database,
    Network,
    Code,
    Server,
    AlertOctagon,
    CheckSquare,
    Brain,
    Sparkles,
    Zap,
    Activity,
    Search,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function IncidentDetailPage() {
    const params = useParams();
    const incidentId = params.id as string;

    const [incident, setIncident] = useState<Incident | null>(null);
    const [auditTrail, setAuditTrail] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showResolveForm, setShowResolveForm] = useState(false);
    const [resolveData, setResolveData] = useState({
        rootCauseCategory: '',
        resolutionNotes: '',
    });

    // AI Remediation states
    const [remediation, setRemediation] = useState<any>(null);
    const [loadingRemediation, setLoadingRemediation] = useState(false);
    const [executingRemediation, setExecutingRemediation] = useState(false);

    // Learning states
    const [showLearnForm, setShowLearnForm] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<any>(null);
    const [loadingSuggestion, setLoadingSuggestion] = useState(false);

    useEffect(() => {
        fetchIncident();
        fetchAuditTrail();
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
            toast.success('Incident acknowledged');
            fetchIncident();
            fetchAuditTrail();
        } catch (error: any) {
            console.error('Failed to acknowledge:', error);
            toast.error(error?.response?.data?.message || 'Failed to acknowledge incident');
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await incidentsApi.updateStatus(incidentId, newStatus);
            toast.success(`Status updated to ${newStatus}`);
            fetchIncident();
            fetchAuditTrail();
        } catch (error: any) {
            console.error('Failed to update status:', error);
            toast.error(error?.response?.data?.message || 'Failed to update status');
        }
    };

    const handleResolve = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await incidentsApi.resolve(incidentId, resolveData);
            toast.success('Incident resolved successfully');
            setShowResolveForm(false);
            setResolveData({ rootCauseCategory: '', resolutionNotes: '' });
            fetchIncident();
            fetchAuditTrail();
        } catch (error: any) {
            console.error('Failed to resolve:', error);
            toast.error(error?.response?.data?.message || 'Failed to resolve incident');
        }
    };

    // AI Analysis Handler
    const handleAIAnalysis = async () => {
        setLoadingRemediation(true);
        try {
            const result = await remediationApi.analyzeIncident(incidentId);
            setRemediation(result);
            if (result.hasPlaybook) {
                toast.success('🤖 AI has proposed an automated fix! Review below.');
            } else {
                toast.info('ℹ️ AI analysis complete. No automated remediation available.');
            }
        } catch (error: any) {
            console.error('Failed to analyze:', error);
            toast.error(error?.response?.data?.message || 'Failed to get AI analysis');
        } finally {
            setLoadingRemediation(false);
        }
    };

    const handleExecuteRemediation = async () => {
        if (!remediation?.executionId) return;

        if (!confirm('Execute this remediation? This will make changes to your systems.')) {
            return;
        }

        setExecutingRemediation(true);
        try {
            const result = await remediationApi.executeRemediation(remediation.executionId);
            toast.success(`✅ Remediation ${result.status}!`);
            setRemediation({ ...remediation, status: result.status });
            fetchIncident();
            fetchAuditTrail();
        } catch (error: any) {
            console.error('Failed to execute:', error);
            toast.error(error?.response?.data?.message || 'Failed to execute remediation');
        } finally {
            setExecutingRemediation(false);
        }
    };

    const handleRejectRemediation = async () => {
        if (!remediation?.executionId) return;

        const reason = prompt('Reason for rejection (optional):');

        try {
            await remediationApi.rejectRemediation(remediation.executionId, 'user', reason || undefined);
            toast.info('❌ Remediation rejected');
            setRemediation(null);
        } catch (error: any) {
            console.error('Failed to reject:', error);
            toast.error(error?.response?.data?.message || 'Failed to reject remediation');
        }
    };

    // Learning Handlers
    const handleGetAISuggestion = async () => {
        setLoadingSuggestion(true);
        try {
            const result = await remediationApi.suggestPlaybookFromResolution(incidentId);
            setAiSuggestion(result);
        } catch (error) {
            console.error('Failed to get AI suggestion:', error);
        } finally {
            setLoadingSuggestion(false);
        }
    };

    const handleSavePlaybook = async (playbookData: any) => {
        try {
            const result = await remediationApi.learnFromResolution(
                incidentId,
                'user',
                playbookData
            );
            toast.success('✅ Playbook saved! AI will use this for future incidents.');
            setShowLearnForm(false);
            setAiSuggestion(null);
        } catch (error: any) {
            console.error('Failed to save playbook:', error);
            toast.error(error?.response?.data?.message || 'Failed to save playbook');
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

    if (!incident) {
        return (
            <div className="min-h-screen flex items-center justify-center font-sans relative">
                <div className="text-center glass-panel p-16 rounded-3xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-500/10 blur-[50px] pointer-events-none"></div>
                    <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                        <ShieldAlert size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Anomaly Not Found</h2>
                    <Link href="/incidents" className="text-slate-400 hover:text-white transition-colors border-b border-white/10 hover:border-white/30 pb-1">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-16 font-sans relative">
            {/* Premium Glass Header */}
            <div className="sticky top-0 z-50 glass-panel border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/incidents"
                            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl cursor-pointer"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <span className="text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-md">
                                    ID: {incident.id.substring(0, 8)}
                                </span>
                                <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-md ${getPriorityColor(
                                        incident.priority
                                    )}`}
                                >
                                    {formatPriority(incident.priority)}
                                </span>
                                <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-md ${getStatusColor(
                                        incident.status
                                    )}`}
                                >
                                    {formatStatus(incident.status)}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold font-sans tracking-tight text-white line-clamp-1 drop-shadow-md">
                                {incident.title}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="border-b border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-wrap gap-3">
                        {/* AI Auto-Fix Button */}
                        {(incident.status === 'open' || incident.status === 'acknowledged') && !remediation && (
                            <button
                                onClick={handleAIAnalysis}
                                disabled={loadingRemediation}
                                className="px-6 py-2.5 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/30 font-bold text-sm rounded-xl hover:bg-purple-600/40 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] disabled:opacity-50 flex items-center gap-2 group"
                            >
                                {loadingRemediation ? (
                                    <>
                                        <Sparkles size={16} className="animate-pulse" /> ANALYZING...
                                    </>
                                ) : (
                                    <>
                                        <Brain size={16} className="group-hover:scale-110 transition-transform" /> [AI_AUTO-FIX]
                                    </>
                                )}
                            </button>
                        )}

                        {/* Standard Action Buttons */}
                        {incident.status === 'open' && (
                            <button
                                onClick={handleAcknowledge}
                                className="px-6 py-2.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-sm rounded-xl hover:bg-indigo-500/40 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                            >
                                Acknowledge Incident
                            </button>
                        )}
                        {incident.status === 'acknowledged' && (
                            <>
                                <button
                                    onClick={() => handleStatusChange('investigating')}
                                    className="px-6 py-2.5 bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold text-sm rounded-xl hover:bg-orange-500/40 transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                                >
                                    [INVESTIGATE]
                                </button>
                                <button
                                    onClick={() => setShowResolveForm(true)}
                                    className="px-6 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-sm rounded-xl hover:bg-emerald-500/40 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                >
                                    [RESOLVE]
                                </button>
                            </>
                        )}
                        {incident.status === 'investigating' && (
                            <button
                                onClick={() => setShowResolveForm(true)}
                                className="px-6 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-sm rounded-xl hover:bg-emerald-500/40 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            >
                                [RESOLVE]
                            </button>
                        )}
                        {incident.status === 'resolved' && incident.resolutionNotes && (
                            <>
                                <span className="px-6 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-sm rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    <CheckSquare size={16} /> SYSTEM_RESTORED
                                </span>
                                <button
                                    onClick={() => {
                                        setShowLearnForm(true);
                                        handleGetAISuggestion();
                                    }}
                                    className="px-6 py-2.5 bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold text-sm rounded-xl hover:bg-pink-500/40 transition-all shadow-[0_0_15px_rgba(236,72,153,0.2)] flex items-center gap-2 group"
                                >
                                    <Brain size={16} className="group-hover:scale-110 transition-transform" /> [TEACH_AI]
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Remediation Proposal */}
            {remediation && remediation.hasPlaybook && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                    <div className="glass-panel border border-purple-500/30 p-6 rounded-2xl relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-pulse"></div>
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white border border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                                    <Brain size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold font-sans text-white tracking-tight drop-shadow-md">
                                        Neural Construct Available
                                    </h3>
                                    <p className="text-sm font-semibold text-purple-300">
                                        CONFIDENCE: {Math.round(remediation.overallConfidence)}% • PLAYBOOK: {remediation.playbook.name}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setRemediation(null)}
                                className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        {/* AI Analysis */}
                        <div className="bg-black/40 border border-white/10 p-5 rounded-xl mb-4 backdrop-blur-sm relative z-10">
                            <h4 className="font-bold text-sm text-purple-400 mb-3 flex items-center gap-2">
                                <Search size={16} /> Analysis Report
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                {remediation.aiAnalysis.analysis}
                            </p>
                            {remediation.aiAnalysis.suggestedActions && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Suggested Actions:</p>
                                    <ul className="text-sm font-medium text-slate-300 space-y-2">
                                        {remediation.aiAnalysis.suggestedActions.map((action: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-purple-400 mt-0.5">→</span>
                                                <span>{action}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Remediation Plan */}
                        <div className="bg-black/40 border border-white/10 p-5 rounded-xl mb-6 backdrop-blur-sm relative z-10">
                            <h4 className="font-bold text-sm text-pink-400 mb-3 flex items-center gap-2">
                                <Terminal size={16} /> Execution Sequence
                            </h4>
                            <p className="text-sm text-slate-300 mb-4 font-medium">{remediation.remediationPlan.plan}</p>

                            {remediation.remediationPlan.steps && remediation.remediationPlan.steps.length > 0 && (
                                <div className="space-y-3">
                                    {remediation.remediationPlan.steps.map((step: any, idx: number) => (
                                        <div key={idx} className="flex items-start gap-4 text-sm bg-white/5 border border-white/10 p-4 rounded-xl">
                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0 shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                                                {step.stepNumber}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-white mb-1">{step.action}</p>
                                                <p className="text-xs font-medium text-slate-400 mb-2">{step.expectedOutcome}</p>
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-md ${step.risk === 'low'
                                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                        : step.risk === 'high'
                                                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                                            : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                                        }`}
                                                >
                                                    RISK: {step.risk.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400">
                                <Clock size={14} className="text-indigo-400" />
                                EST_TIME: {remediation.remediationPlan.estimatedTime}
                            </div>
                        </div>

                        {/* Warnings */}
                        {remediation.remediationPlan.warnings && remediation.remediationPlan.warnings.length > 0 && (
                            <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl mb-6 relative z-10 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                                <p className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2">
                                    <AlertTriangle size={16} /> WARNINGS:
                                </p>
                                <ul className="text-sm font-medium text-orange-300/80 space-y-1.5 ml-6 list-disc">
                                    {remediation.remediationPlan.warnings.map((warning: string, idx: number) => (
                                        <li key={idx}>{warning}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4 relative z-10">
                            <button
                                onClick={handleExecuteRemediation}
                                disabled={executingRemediation}
                                className="flex-1 sm:flex-none sm:min-w-[200px] px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {executingRemediation ? (
                                    <>
                                        <Zap size={16} className="animate-pulse" /> EXECUTING MATRIX...
                                    </>
                                ) : (
                                    <>
                                        <CheckSquare size={16} /> EXECUTE FIX
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleRejectRemediation}
                                className="flex-1 sm:flex-none sm:min-w-[150px] px-6 py-3.5 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Teach AI Form */}
            {showLearnForm && incident.status === 'resolved' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                    <div className="glass-panel border border-pink-500/30 p-6 rounded-2xl relative overflow-hidden shadow-[0_0_30px_rgba(236,72,153,0.15)]">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 animate-pulse"></div>
                        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-pink-500/20 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl flex items-center justify-center text-white border border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                                    <Brain size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold font-sans text-white tracking-tight drop-shadow-md">
                                        Synthesize Resolution
                                    </h3>
                                    <p className="text-sm font-semibold text-pink-300">
                                        CREATE_REUSABLE_PLAYBOOK_FOR_FUTURE_ANOMALIES
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowLearnForm(false);
                                    setAiSuggestion(null);
                                }}
                                className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="relative z-10">
                            {loadingSuggestion ? (
                                <div className="text-center py-16">
                                    <Brain className="animate-pulse mx-auto mb-5 text-pink-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" size={56} />
                                    <p className="font-bold text-slate-300 text-lg">AI ANALYZING RESOLUTION PATHWAY...</p>
                                </div>
                            ) : aiSuggestion ? (
                                <div className="glass-panel p-6 rounded-xl border-white/10">
                                    <PlaybookForm
                                        suggestion={aiSuggestion.playbook}
                                        onSave={handleSavePlaybook}
                                        onCancel={() => {
                                            setShowLearnForm(false);
                                            setAiSuggestion(null);
                                        }}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Resolve Form */}
                        {showResolveForm && (
                            <div className="glass-panel border-emerald-500/30 p-8 rounded-2xl relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                <div className="absolute top-0 right-0 p-3 bg-white/5 border-b border-l border-white/10 text-emerald-400 font-sans text-xs font-bold rounded-bl-2xl">
                                    // RESOLUTION_PROTOCOL
                                </div>
                                <h2 className="text-2xl font-bold font-sans text-white mb-6">
                                    Execute Resolution
                                </h2>
                                <form onSubmit={handleResolve} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 tracking-wide uppercase">
                                            Root Cause Category
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={resolveData.rootCauseCategory}
                                                onChange={(e) =>
                                                    setResolveData({ ...resolveData, rootCauseCategory: e.target.value })
                                                }
                                                className="w-full px-5 py-3.5 bg-black/40 border border-white/10 text-white font-sans text-sm rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none"
                                                required
                                            >
                                                <option value="" className="bg-slate-900">-- SELECT_CATEGORY --</option>
                                                <option value="database" className="bg-slate-900">DATABASE</option>
                                                <option value="network" className="bg-slate-900">NETWORK</option>
                                                <option value="third_party_api" className="bg-slate-900">THIRD_PARTY_API</option>
                                                <option value="code_bug" className="bg-slate-900">CODE_BUG</option>
                                                <option value="configuration" className="bg-slate-900">CONFIGURATION</option>
                                                <option value="infrastructure" className="bg-slate-900">INFRASTRUCTURE</option>
                                                <option value="security" className="bg-slate-900">SECURITY</option>
                                                <option value="resource_exhaustion" className="bg-slate-900">RESOURCE_EXHAUSTION</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 tracking-wide uppercase">
                                            Resolution Notes
                                        </label>
                                        <textarea
                                            value={resolveData.resolutionNotes}
                                            onChange={(e) =>
                                                setResolveData({ ...resolveData, resolutionNotes: e.target.value })
                                            }
                                            rows={5}
                                            className="w-full px-5 py-4 bg-black/40 border border-white/10 text-white font-sans text-sm rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-y placeholder:text-slate-600"
                                            placeholder="> Enter detailed resolution steps..."
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <button
                                            type="submit"
                                            className="px-8 py-3.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-sm rounded-xl hover:bg-emerald-500/40 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                        >
                                            Submit Report
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowResolveForm(false)}
                                            className="px-8 py-3.5 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-xl hover:bg-white/10 transition-all"
                                        >
                                            Abort
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Incident Details */}
                        <div className="glass-panel p-8 rounded-2xl relative">
                            <h2 className="text-sm font-bold text-slate-400 tracking-wide mb-6 border-b border-white/10 pb-3 flex justify-between uppercase">
                                <span>Triage Data</span>
                                <span className="text-slate-500">{formatDateTime(incident.createdAt)}</span>
                            </h2>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <dt className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-wider">
                                        <Server size={14} className="text-indigo-400" /> Source System
                                    </dt>
                                    <dd className="text-sm font-semibold text-white">
                                        {incident.source}
                                    </dd>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <dt className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-wider">
                                        <AlertOctagon size={14} className="text-orange-400" /> Event Type
                                    </dt>
                                    <dd className="text-sm font-semibold text-white">
                                        {incident.eventType.replace(/_/g, ' ').toUpperCase()}
                                    </dd>
                                </div>

                                {incident.acknowledgedAt && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 border-l-4 border-l-blue-500/50">
                                        <dt className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Acknowledged At</dt>
                                        <dd className="text-sm font-semibold text-white">
                                            {formatDateTime(incident.acknowledgedAt)}
                                        </dd>
                                    </div>
                                )}
                                {incident.resolvedAt && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 border-l-4 border-l-emerald-500/50">
                                        <dt className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Resolved At</dt>
                                        <dd className="text-sm font-semibold text-white">
                                            {formatDateTime(incident.resolvedAt)}
                                        </dd>
                                    </div>
                                )}

                                {incident.rootCauseCategory && (
                                    <div className="sm:col-span-2 bg-white/5 rounded-xl p-4 border border-white/5 border-l-4 border-l-purple-500/50">
                                        <dt className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-wider">
                                            <span className="text-purple-400">{getRootCauseIcon(incident.rootCauseCategory)}</span> Root Cause
                                        </dt>
                                        <dd className="text-sm font-semibold text-white">
                                            {incident.rootCauseCategory.replace(/_/g, ' ').toUpperCase()}
                                        </dd>
                                    </div>
                                )}
                                {incident.resolutionNotes && (
                                    <div className="sm:col-span-2 bg-white/5 rounded-xl p-4 border border-white/5 border-l-4 border-l-emerald-500/50">
                                        <dt className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Resolution Notes</dt>
                                        <dd className="text-sm font-medium text-slate-300 whitespace-pre-wrap leading-relaxed">
                                            {incident.resolutionNotes}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Timeline */}
                        <div className="glass-panel p-8 rounded-2xl">
                            <h2 className="text-sm font-bold text-slate-400 tracking-wide mb-8 border-b border-white/10 pb-3 flex items-center justify-between uppercase">
                                <span>System Log</span>
                                <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs">{auditTrail.length} Records</span>
                            </h2>
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {auditTrail.map((entry, idx) => (
                                        <li key={entry.id}>
                                            <div className="relative pb-8">
                                                {idx !== auditTrail.length - 1 && (
                                                    <span
                                                        className="absolute top-5 left-[19px] -ml-px h-full w-[2px] bg-white/10"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <div className="relative flex items-start space-x-4">
                                                    <div>
                                                        <span className={`h-10 w-10 rounded-xl border flex items-center justify-center bg-black/40 shadow-lg ${getActionColor(entry.action)}`}>
                                                            <span className="text-xs font-bold">
                                                                {getActionIcon(entry.action)}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 glass-panel border-white/5 p-4 rounded-xl mt-1 hover:border-white/10 transition-colors">
                                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-2 mb-2">
                                                            <p className="text-sm font-bold text-white tracking-wide">
                                                                {formatAction(entry.action)}
                                                            </p>
                                                            <div className="whitespace-nowrap text-xs font-medium text-slate-400">
                                                                {formatDateTime(entry.timestamp)}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> {entry.actorEmail}
                                                        </p>
                                                        {entry.toValue && (
                                                            <div className="mt-3 bg-black/40 border border-white/5 p-3 rounded-lg overflow-x-auto">
                                                                <pre className="text-xs sm:text-xs font-medium text-slate-400 font-mono">
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
                        <div className="glass-panel p-6 rounded-2xl sticky top-28">
                            <h2 className="text-sm font-bold text-slate-400 tracking-wide mb-6 border-b border-white/10 pb-3 flex items-center gap-2 uppercase">
                                <Cpu size={16} className="text-indigo-400" /> Metadata
                            </h2>
                            <dl className="space-y-4">
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <dt className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                        Escalation Level
                                    </dt>
                                    <dd className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="text-orange-400">Lvl {incident.escalationLevel}</span>
                                    </dd>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <dt className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                        Event Multiplier
                                    </dt>
                                    <dd className="text-lg font-bold text-white">
                                        x{incident.eventCount}
                                    </dd>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <dt className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                        Organization
                                    </dt>
                                    <dd className="text-sm font-semibold text-white truncate" title={incident.organization.name}>
                                        {incident.organization.name}
                                    </dd>
                                </div>
                            </dl>

                            {incident.metadata && Object.keys(incident.metadata).length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                                        Raw Payload
                                    </h3>
                                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl overflow-auto max-h-64 custom-scrollbar">
                                        <pre className="text-xs font-medium text-slate-400 font-mono">
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
        case 'database': return <Database size={16} />;
        case 'network': return <Network size={16} />;
        case 'code_bug': return <Code size={16} />;
        case 'infrastructure': return <Server size={16} />;
        case 'security': return <ShieldAlert size={16} />;
        default: return <Cpu size={16} />;
    }
}

function getActionColor(action: string): string {
    if (action.includes('created')) return 'text-red-400 border-red-500/30 bg-red-500/10 text-[10px]';
    if (action.includes('acknowledged')) return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10 text-[10px]';
    if (action.includes('resolved')) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px]';
    if (action.includes('escalated')) return 'text-orange-400 border-orange-500/30 bg-orange-500/10 text-[10px]';
    return 'text-slate-400 border-slate-500/30 bg-slate-500/10 text-[10px]';
}

function getActionIcon(action: string): string {
    const icons: Record<string, string> = {
        incident_created: 'SYS',
        incident_acknowledged: 'ACK',
        incident_escalated: 'UP',
        incident_resolved: 'OK',
        incident_status_changed: 'MOD',
        remediation_executed: 'AI',
        playbook_created: 'NEW',
    };
    return icons[action] || 'LOG';
}

function formatAction(action: string): string {
    return action.split('_').join(' ').toUpperCase();
}