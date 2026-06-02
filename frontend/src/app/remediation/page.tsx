'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { remediationApi } from '@/lib/api';
import { Bot, ArrowLeft, Terminal, Activity } from 'lucide-react';

export default function RemediationHistoryPage() {
    const [executions, setExecutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    return (
        <div className="min-h-screen font-sans relative pb-16">
            {/* Premium Glass Header */}
            <div className="sticky top-0 z-50 glass-panel border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/incidents"
                                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl cursor-pointer"
                            >
                                <ArrowLeft size={20} />
                            </Link>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-3 drop-shadow-md">
                                    <Bot className="text-purple-400" /> Neural Remediation History
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-slide-up relative z-10">
                <div className="glass-panel rounded-3xl p-16 text-center overflow-hidden relative border border-white/10">
                    <div className="absolute inset-0 bg-purple-500/10 blur-[50px] pointer-events-none"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-400 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                        <Terminal size={48} />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
                        Execution Metrics Offline
                    </h3>
                    <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
                        This module will display all AI-powered remediation sequences, operation success rates, and continuous learning insights.
                    </p>

                    <div className="mt-10 flex items-center gap-3 justify-center text-sm font-bold tracking-widest uppercase text-slate-500">
                        <Activity size={18} className="animate-pulse text-purple-500" /> Awaiting Module Integration
                    </div>
                </div>
            </div>
        </div>
    );
}