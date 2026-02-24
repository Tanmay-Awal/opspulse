import { IncidentPriority, IncidentStatus } from '@/types/incident';

export function getPriorityColor(priority: IncidentPriority): string {
    const colors = {
        p1_critical: 'bg-transparent text-deep-red border-deep-red shadow-[2px_2px_0px_0px_#E11D48]',
        p2_high: 'bg-transparent text-signal-orange border-signal-orange shadow-[2px_2px_0px_0px_#FF4500]',
        p3_medium: 'bg-transparent text-yellow-500 border-yellow-500 shadow-[2px_2px_0px_0px_#EAB308]',
        p4_low: 'bg-transparent text-blue-500 border-blue-500 shadow-[2px_2px_0px_0px_#3B82F6]',
    };
    return colors[priority] || colors.p3_medium;
}

export function getPriorityBadgeColor(priority: IncidentPriority): string {
    const colors = {
        p1_critical: 'bg-deep-red',
        p2_high: 'bg-signal-orange',
        p3_medium: 'bg-yellow-500',
        p4_low: 'bg-blue-500',
    };
    return colors[priority] || colors.p3_medium;
}

export function getStatusColor(status: IncidentStatus): string {
    const colors = {
        open: 'bg-deep-red/10 text-deep-red border-deep-red/50 shadow-[0_0_10px_rgba(225,29,72,0.2)]',
        acknowledged: 'bg-blue-500/10 text-blue-400 border-blue-500/50',
        investigating: 'bg-signal-orange/10 text-signal-orange border-signal-orange/50',
        resolved: 'bg-acid-green/10 text-acid-green border-acid-green/30',
        closed: 'bg-neutral-900 text-neutral-400 border-neutral-800',
    };
    return colors[status] || colors.open;
}

export function formatPriority(priority: IncidentPriority): string {
    const labels = {
        p1_critical: 'P1 Critical',
        p2_high: 'P2 High',
        p3_medium: 'P3 Medium',
        p4_low: 'P4 Low',
    };
    return labels[priority] || priority;
}

export function formatStatus(status: IncidentStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
}

export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}