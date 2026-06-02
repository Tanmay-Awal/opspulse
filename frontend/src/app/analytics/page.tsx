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

const COLORS = ['#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

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
            <div className="min-h-screen flex flex-col items-center justify-center font-sans text-slate-500 relative">
                <Activity className="animate-spin text-purple-600 mb-4" size={32} />
                <p className="font-medium text-slate-400 z-10">Aggregating telemetry data...</p>
            </div>
        );
    }

    const priorityData = [
        { name: 'P1 CRITICAL', value: slaMetrics?.p1Count || 0, color: '#EF4444' },
        { name: 'P2 HIGH', value: slaMetrics?.p2Count || 0, color: '#F59E0B' },
        { name: 'P3 MEDIUM', value: slaMetrics?.p3Count || 0, color: '#10B981' },
        { name: 'P4 LOW', value: slaMetrics?.p4Count || 0, color: '#3B82F6' },
    ];

    return (
        <div className="min-h-screen pb-16 font-sans relative">
            {/* Premium Glassmorphism Header */}
            <div className="sticky top-0 z-50 glass-panel border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl cursor-pointer"
                            >
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2 drop-shadow-md">
                                    <Activity className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" size={24} />
                                    System Analytics
                                </h1>
                                <p className="text-xs font-medium font-sans text-slate-400 mt-1">
                                    Platform and personnel metrics
                                </p>
                            </div>
                        </div>

                        {/* Export Buttons + Filters in Header */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => handleExport('sla')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold rounded-lg hover:text-white hover:bg-white/10 transition-all shadow-sm group"
                            >
                                <Download size={14} className="group-hover:text-purple-400 transition-colors" /> SLA Metrics
                            </button>
                            <button
                                onClick={() => handleExport('root-causes')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold rounded-lg hover:text-white hover:bg-white/10 transition-all shadow-sm group"
                            >
                                <Download size={14} className="group-hover:text-pink-400 transition-colors" /> Root Causes
                            </button>
                            <button
                                onClick={() => handleExport('team-performance')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold rounded-lg hover:text-white hover:bg-white/10 transition-all shadow-sm group"
                            >
                                <Download size={14} className="group-hover:text-blue-400 transition-colors" /> Team Performance
                            </button>

                            <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>

                            <div className="flex bg-black/40 border border-white/10 p-1 rounded-xl backdrop-blur-md">
                                {([7, 30, 90] as const).map((days) => (
                                    <button
                                        key={days}
                                        onClick={() => setTimeRange(days)}
                                        className={`px-4 py-1.5 text-xs font-bold transition-all duration-300 rounded-lg ${timeRange === days
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {days}D
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-slide-up relative z-10">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Incidents"
                        value={slaMetrics?.totalIncidents || 0}
                        icon={<AlertTriangle size={24} />}
                        color="text-indigo-400"
                        bgGlow="bg-indigo-500/20"
                        borderColor="border-indigo-500/30"
                    />
                    <MetricCard
                        title="SLA Compliance"
                        value={`${slaMetrics?.slaComplianceRate || 0}%`}
                        icon={<Award size={24} />}
                        color={slaMetrics?.slaComplianceRate >= 95 ? 'text-emerald-400' : 'text-red-400'}
                        bgGlow={slaMetrics?.slaComplianceRate >= 95 ? 'bg-emerald-500/20' : 'bg-red-500/20'}
                        borderColor={slaMetrics?.slaComplianceRate >= 95 ? 'border-emerald-500/30' : 'border-red-500/30'}
                    />
                    <MetricCard
                        title="Average Ack Time"
                        value={`${slaMetrics?.avgAcknowledgmentTimeMinutes || 0}m`}
                        icon={<Clock size={24} />}
                        color="text-purple-400"
                        bgGlow="bg-purple-500/20"
                        borderColor="border-purple-500/30"
                    />
                    <MetricCard
                        title="Average Resolve Time"
                        value={`${Math.round((slaMetrics?.avgResolutionTimeMinutes || 0) / 60)}h`}
                        icon={<Activity size={24} />}
                        color="text-orange-400"
                        bgGlow="bg-orange-500/20"
                        borderColor="border-orange-500/30"
                    />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Incident Trend */}
                    <div className="glass-panel rounded-2xl p-6 relative">
                        <h2 className="text-sm font-bold text-slate-300 tracking-wide mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
                            <Activity size={16} className="text-purple-400" /> Time Series Incidents
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888' }} stroke="#ffffff20" />
                                <YAxis tick={{ fill: '#888' }} stroke="#ffffff20" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#ffffff20', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ fontFamily: 'monospace' }}
                                />
                                <Legend wrapperStyle={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#aaa' }} />
                                <Line type="monotone" dataKey="p1" stroke="#EF4444" name="P1 CRIT" strokeWidth={3} dot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="p2" stroke="#F59E0B" name="P2 HIGH" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }} />
                                <Line type="monotone" dataKey="p3" stroke="#10B981" name="P3 MED" strokeWidth={3} dot={false} />
                                <Line type="monotone" dataKey="p4" stroke="#3B82F6" name="P4 LOW" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Priority Distribution */}
                    <div className="glass-panel rounded-2xl p-6 relative">
                        <h2 className="text-sm font-bold text-slate-300 tracking-wide mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
                            <AlertTriangle size={16} className="text-pink-400" /> Severity Breakdown
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
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#ffffff20', color: '#fff', borderRadius: '8px', fontFamily: 'monospace' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Root Cause Distribution */}
                    <div className="glass-panel rounded-2xl p-6 relative">
                        <h2 className="text-sm font-bold text-slate-300 tracking-wide mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
                            <Clock size={16} className="text-blue-400" /> Root Cause Distribution
                        </h2>
                        {rootCauseStats.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 font-sans text-sm font-medium">
                                No telemetry data available
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={rootCauseStats}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#888' }} stroke="#ffffff20" interval={0} angle={-45} textAnchor="end" height={80} />
                                    <YAxis tick={{ fill: '#888' }} stroke="#ffffff20" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#ffffff20', color: '#fff', borderRadius: '8px', fontFamily: 'monospace' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {rootCauseStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* SLA Performance */}
                    <div className="glass-panel rounded-2xl p-6 relative">
                        <h2 className="text-sm font-bold text-slate-300 tracking-wide mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
                            <Award size={16} className="text-emerald-400" /> SLA Adherence Ratios
                        </h2>
                        <div className="space-y-8 mt-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-400">
                                        Acknowledgment SLA
                                    </span>
                                    <span className="text-xs font-bold text-white">
                                        {slaMetrics?.acknowledgedOnTime || 0} / {(slaMetrics?.acknowledgedOnTime || 0) + (slaMetrics?.acknowledgedLate || 0)} On Time
                                    </span>
                                </div>
                                <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full relative"
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
                                    <span className="text-xs font-semibold text-slate-400">
                                        Resolution SLA
                                    </span>
                                    <span className="text-xs font-bold text-white">
                                        {slaMetrics?.resolvedOnTime || 0} / {(slaMetrics?.resolvedOnTime || 0) + (slaMetrics?.resolvedLate || 0)} On Time
                                    </span>
                                </div>
                                <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full relative"
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

                            <div className="pt-6 border-t border-white/10">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-sm backdrop-blur-sm">
                                        <p className="text-3xl font-bold text-emerald-400 mb-1 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                            {slaMetrics?.acknowledgedOnTime || 0}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-400">SYS_On Time</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-sm backdrop-blur-sm">
                                        <p className="text-3xl font-bold text-red-400 mb-1 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                                            {slaMetrics?.acknowledgedLate || 0}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-400">System Violation</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Performance Table */}
                <div className="glass-panel rounded-2xl relative overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/10 bg-white/5">
                        <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2 drop-shadow-sm">
                            <Users size={16} className="text-indigo-400" /> Team Efficiency Matrix
                        </h2>
                    </div>
                    {teamPerformance.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 font-sans text-sm font-medium">
                            No personnel data found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/10">
                                <thead className="bg-black/40">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 tracking-wider">
                                            Engineer
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 tracking-wider">
                                            Handled
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 tracking-wider">
                                            MTTA
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 tracking-wider">
                                            MTTR
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 tracking-wider">
                                            Compliance
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-transparent">
                                    {teamPerformance.map((member) => (
                                        <tr key={member.userId} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-white flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                                {member.userName}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-300">
                                                {member.incidentsHandled}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-300">
                                                {member.avgAcknowledgmentMinutes}m
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-300">
                                                {Math.round(member.avgResolutionMinutes / 60)}h
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg border backdrop-blur-sm ${member.slaComplianceRate >= 95
                                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                                        : member.slaComplianceRate >= 80
                                                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                                                            : 'bg-red-500/20 text-red-300 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
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
    bgGlow,
    borderColor
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    bgGlow: string;
    borderColor: string;
}) {
    return (
        <div className={`glass-panel glass-panel-hover border ${borderColor} rounded-2xl p-6 relative overflow-hidden group`}>
            {/* Background glowing orb */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[40px] transition-colors ${bgGlow} opacity-50 group-hover:opacity-100`}></div>

            <div className="flex flex-col justify-between h-full relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <p className="text-sm font-semibold text-slate-400 tracking-wide w-2/3">
                        {title}
                    </p>
                    <div className={`p-2.5 rounded-xl border border-white/10 ${bgGlow} text-white backdrop-blur-md shadow-sm`}>
                        {icon}
                    </div>
                </div>
                <div>
                    <p className={`text-4xl font-extrabold tracking-tight drop-shadow-md ${color === 'text-white' ? 'text-white' : 'text-white'}`}>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}
