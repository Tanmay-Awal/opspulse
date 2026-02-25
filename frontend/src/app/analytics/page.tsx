'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { analyticsApi, API_BASE_URL, ORG_ID } from '@/lib/api';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Terminal, ArrowLeft, Download, Activity, Clock, Award, Users, AlertTriangle } from 'lucide-react';

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
    const [slaMetrics, setSlaMetrics] = useState<any>(null);
    const [rootCauseStats, setRootCauseStats] = useState<any[]>([]);
    const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);

    const endDateStr = new Date().toISOString().split('T')[0];
    const startDateStr = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    useEffect(() => {
        fetchAllData();
    }, [timeRange]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [sla, rootCauses, team, trend] = await Promise.all([
                analyticsApi.getSLAMetrics(startDateStr, endDateStr),
                analyticsApi.getRootCauseStats(startDateStr, endDateStr),
                analyticsApi.getTeamPerformance(startDateStr, endDateStr),
                analyticsApi.getIncidentTrend(timeRange),
            ]);

            setSlaMetrics(sla);
            setRootCauseStats(rootCauses);
            setTeamPerformance(team);
            setTrendData(trend);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (type: string) => {
        const url = `${API_BASE_URL}/analytics/export?orgId=${ORG_ID}&type=${type}&startDate=${startDateStr}&endDate=${endDateStr}`;
        window.open(url, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex flex-col items-center justify-center font-mono text-neutral-500">
                <Terminal className="animate-pulse mb-4" size={32} />
                <p>AGGREGATING_DATA_SYSTEMS...</p>
            </div>
        );
    }

    const priorityData = [
        { name: 'P1 CRITICAL', value: slaMetrics?.p1Count || 0, color: '#EF4444' },
        { name: 'P2 HIGH', value: slaMetrics?.p2Count || 0, color: '#F59E0B' },
        { name: 'P3 MEDIUM', value: slaMetrics?.p3Count || 0, color: '#FBBF24' },
        { name: 'P4 LOW', value: slaMetrics?.p4Count || 0, color: '#3B82F6' },
    ];

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
                                    <Activity className="text-acid-green" size={20} />
                                    SYSTEM_ANALYTICS
                                </h1>
                                <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest mt-1">
                                    PERFORMANCE_METRICS_AND_INSIGHTS
                                </p>
                            </div>
                        </div>

                        {/* Top Filters */}
                        <div className="flex bg-neutral-900 border border-neutral-800 p-1">
                            {([7, 30, 90] as const).map((days) => (
                                <button
                                    key={days}
                                    onClick={() => setTimeRange(days)}
                                    className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-200 ${timeRange === days
                                        ? 'bg-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(37,99,235,0.5)]'
                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                        }`}
                                >
                                    {days}D
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar / Export */}
            <div className="border-b border-neutral-800 bg-neutral-950/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest mr-2">
                            [DATA_EXPORTS]
                        </span>
                        <button
                            onClick={() => handleExport('sla')}
                            className="flex items-center gap-2 px-4 py-1.5 bg-transparent border border-neutral-700 text-neutral-400 text-xs font-mono uppercase tracking-widest hover:text-white hover:border-white transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
                        >
                            <Download size={14} /> SLA_METRICS
                        </button>
                        <button
                            onClick={() => handleExport('root-causes')}
                            className="flex items-center gap-2 px-4 py-1.5 bg-transparent border border-neutral-700 text-neutral-400 text-xs font-mono uppercase tracking-widest hover:text-white hover:border-white transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
                        >
                            <Download size={14} /> ROOT_CAUSES
                        </button>
                        <button
                            onClick={() => handleExport('team-performance')}
                            className="flex items-center gap-2 px-4 py-1.5 bg-transparent border border-neutral-700 text-neutral-400 text-xs font-mono uppercase tracking-widest hover:text-white hover:border-white transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
                        >
                            <Download size={14} /> TEAM_PERFORMANCE
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-slide-up">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="TOTAL_INCIDENTS"
                        value={slaMetrics?.totalIncidents || 0}
                        icon={<AlertTriangle size={24} />}
                        color="text-blue-500"
                        borderColor="border-blue-500/50"
                    />
                    <MetricCard
                        title="SLA_COMPLIANCE"
                        value={`${slaMetrics?.slaComplianceRate || 0}%`}
                        icon={<Award size={24} />}
                        color={slaMetrics?.slaComplianceRate >= 95 ? 'text-acid-green' : 'text-deep-red'}
                        borderColor={slaMetrics?.slaComplianceRate >= 95 ? 'border-acid-green/50' : 'border-deep-red/50'}
                    />
                    <MetricCard
                        title="AVG_ACK_TIME"
                        value={`${slaMetrics?.avgAcknowledgmentTimeMinutes || 0}m`}
                        icon={<Clock size={24} />}
                        color="text-purple-500"
                        borderColor="border-purple-500/50"
                    />
                    <MetricCard
                        title="AVG_RESOLVE_TIME"
                        value={`${Math.round((slaMetrics?.avgResolutionTimeMinutes || 0) / 60)}h`}
                        icon={<Activity size={24} />}
                        color="text-signal-orange"
                        borderColor="border-signal-orange/50"
                    />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Incident Trend */}
                    <div className="bg-neutral-950 border border-neutral-800 p-6 relative">
                        <div className="absolute top-0 right-0 p-2 border-b border-l border-neutral-800 bg-black text-neutral-500 font-mono text-[10px] tracking-widest">
                            // TREND_ANALYSIS
                        </div>
                        <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-widest mb-6 border-b border-neutral-800 pb-2">
                            TIME_SERIES_INCIDENTS
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888' }} stroke="#555" />
                                <YAxis tick={{ fill: '#888' }} stroke="#555" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
                                    itemStyle={{ fontFamily: 'monospace' }}
                                />
                                <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }} />
                                <Line type="step" dataKey="p1" stroke="#EF4444" name="P1_CRIT" strokeWidth={2} dot={false} />
                                <Line type="step" dataKey="p2" stroke="#F59E0B" name="P2_HIGH" strokeWidth={2} dot={false} />
                                <Line type="step" dataKey="p3" stroke="#FBBF24" name="P3_MED" strokeWidth={2} dot={false} />
                                <Line type="step" dataKey="p4" stroke="#3B82F6" name="P4_LOW" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Priority Distribution */}
                    <div className="bg-neutral-950 border border-neutral-800 p-6 relative">
                        <div className="absolute top-0 right-0 p-2 border-b border-l border-neutral-800 bg-black text-neutral-500 font-mono text-[10px] tracking-widest">
                            // PRIORITY_DIST
                        </div>
                        <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-widest mb-6 border-b border-neutral-800 pb-2">
                            SEVERITY_BREAKDOWN
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={priorityData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: any) =>
                                        `${name}: ${(percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={100}
                                    stroke="none"
                                    dataKey="value"
                                >
                                    {priorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff', fontFamily: 'monospace' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Root Cause Distribution */}
                    <div className="bg-neutral-950 border border-neutral-800 p-6 relative">
                        <div className="absolute top-0 right-0 p-2 border-b border-l border-neutral-800 bg-black text-neutral-500 font-mono text-[10px] tracking-widest">
                            // ROOT_CAUSE_STATS
                        </div>
                        <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-widest mb-6 border-b border-neutral-800 pb-2">
                            ROOT_CAUSE_DISTRIBUTION
                        </h2>
                        {rootCauseStats.length === 0 ? (
                            <div className="text-center py-12 text-neutral-600 font-mono text-sm uppercase">
                                [NO_RESOLVED_DATA_FOUND]
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={rootCauseStats}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#888' }} stroke="#555" interval={0} angle={-45} textAnchor="end" height={80} />
                                    <YAxis tick={{ fill: '#888' }} stroke="#555" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff', fontFamily: 'monospace' }}
                                        cursor={{ fill: '#222' }}
                                    />
                                    <Bar dataKey="count" fill="#3B82F6">
                                        {rootCauseStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* SLA Performance */}
                    <div className="bg-neutral-950 border border-neutral-800 p-6 relative">
                        <div className="absolute top-0 right-0 p-2 border-b border-l border-neutral-800 bg-black text-neutral-500 font-mono text-[10px] tracking-widest">
                            // SLA_V_ACTUAL
                        </div>
                        <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-widest mb-6 border-b border-neutral-800 pb-2">
                            SLA_ADHERENCE_RATIOS
                        </h2>
                        <div className="space-y-8 mt-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-mono text-neutral-400">
                                        [ACKNOWLEDGE_SLA]
                                    </span>
                                    <span className="text-xs font-mono font-bold text-white">
                                        {slaMetrics?.acknowledgedOnTime || 0} / {(slaMetrics?.acknowledgedOnTime || 0) + (slaMetrics?.acknowledgedLate || 0)} ON_TIME
                                    </span>
                                </div>
                                <div className="w-full bg-neutral-900 h-2 border border-neutral-800">
                                    <div
                                        className="bg-acid-green h-full relative"
                                        style={{
                                            width: `${((slaMetrics?.acknowledgedOnTime || 0) /
                                                ((slaMetrics?.acknowledgedOnTime || 0) +
                                                    (slaMetrics?.acknowledgedLate || 1))) *
                                                100
                                                }%`,
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-mono text-neutral-400">
                                        [RESOLUTION_SLA]
                                    </span>
                                    <span className="text-xs font-mono font-bold text-white">
                                        {slaMetrics?.resolvedOnTime || 0} / {(slaMetrics?.resolvedOnTime || 0) + (slaMetrics?.resolvedLate || 0)} ON_TIME
                                    </span>
                                </div>
                                <div className="w-full bg-neutral-900 h-2 border border-neutral-800">
                                    <div
                                        className="bg-blue-500 h-full relative"
                                        style={{
                                            width: `${((slaMetrics?.resolvedOnTime || 0) /
                                                ((slaMetrics?.resolvedOnTime || 0) +
                                                    (slaMetrics?.resolvedLate || 1))) *
                                                100
                                                }%`,
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-neutral-800">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="bg-neutral-900 border border-neutral-800 p-4">
                                        <p className="text-3xl font-mono font-bold text-acid-green mb-1">
                                            {slaMetrics?.acknowledgedOnTime || 0}
                                        </p>
                                        <p className="text-[10px] font-mono text-neutral-500 uppercase">SYS_ON_TIME</p>
                                    </div>
                                    <div className="bg-neutral-900 border border-neutral-800 p-4">
                                        <p className="text-3xl font-mono font-bold text-deep-red mb-1">
                                            {slaMetrics?.acknowledgedLate || 0}
                                        </p>
                                        <p className="text-[10px] font-mono text-neutral-500 uppercase">SYS_VIOLATION</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Performance Table */}
                <div className="bg-neutral-950 border border-neutral-800 relative">
                    <div className="absolute top-0 right-0 p-2 border-b border-l border-neutral-800 bg-black text-neutral-500 font-mono text-[10px] tracking-widest z-10">
                        // PERSONNEL_STATS
                    </div>
                    <div className="px-6 py-4 border-b border-neutral-800">
                        <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                            <Users size={16} /> TEAM_EFFICIENCY_MATRIX
                        </h2>
                    </div>
                    {teamPerformance.length === 0 ? (
                        <div className="text-center py-12 text-neutral-600 font-mono text-sm uppercase">
                            [NO_PERSONNEL_DATA_FOUND]
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-800">
                                <thead className="bg-black">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                                            ENGINEER_ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                                            HANDLED
                                        </th>
                                        <th className="px-6 py-3 text-left text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                                            MTTA
                                        </th>
                                        <th className="px-6 py-3 text-left text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                                            MTTR
                                        </th>
                                        <th className="px-6 py-3 text-left text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                                            COMPLIANCE
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-neutral-950 divide-y divide-neutral-800/50">
                                    {teamPerformance.map((member) => (
                                        <tr key={member.userId} className="hover:bg-neutral-900 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-none bg-acid-green"></div>
                                                {member.userName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-neutral-400">
                                                {member.incidentsHandled}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-neutral-400">
                                                {member.avgAcknowledgmentMinutes}m
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-neutral-400">
                                                {Math.round(member.avgResolutionMinutes / 60)}h
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest border ${member.slaComplianceRate >= 95
                                                        ? 'bg-acid-green/10 text-acid-green border-acid-green/50'
                                                        : member.slaComplianceRate >= 80
                                                            ? 'bg-signal-orange/10 text-signal-orange border-signal-orange/50'
                                                            : 'bg-deep-red/10 text-deep-red border-deep-red/50'
                                                        }`}
                                                >
                                                    {member.slaComplianceRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    icon,
    color,
    borderColor
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
}) {
    return (
        <div className={`bg-neutral-950 border ${borderColor} p-6 relative overflow-hidden group hover:bg-neutral-900 transition-colors`}>
            {/* Top decorative stripe */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 ${color}`} />

            <div className="flex flex-col justify-between h-full">
                <div className="flex items-start justify-between mb-4">
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest leading-tight w-2/3">
                        {title}
                    </p>
                    <div className={`p-2 bg-black border ${borderColor} ${color}`}>
                        {icon}
                    </div>
                </div>
                <div>
                    <p className="text-3xl font-mono font-bold text-white tracking-tighter">
                        {value}
                    </p>
                </div>
            </div>

            {/* Bottom-right corner accent */}
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-neutral-600 m-1" />
        </div>
    );
}
