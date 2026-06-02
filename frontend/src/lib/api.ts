import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// For demo, we'll hardcode the org ID
// In production, this would come from user session
export const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || 'YOUR_ORG_ID_HERE';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Incident API
export const incidentsApi = {
    // Get all incidents
    getAll: async (filters?: { status?: string; priority?: string; page?: number; limit?: number }) => {
        const params = { orgId: ORG_ID, ...filters };
        const response = await api.get('/incidents', { params });
        return response.data;
    },

    // Get single incident
    getOne: async (id: string) => {
        const response = await api.get(`/incidents/${id}`, { params: { orgId: ORG_ID } });
        return response.data;
    },

    // Acknowledge incident
    acknowledge: async (id: string) => {
        const response = await api.patch(`/incidents/${id}/acknowledge`, {}, {
            params: { orgId: ORG_ID },
        });
        return response.data;
    },

    // Resolve incident
    resolve: async (id: string, data: { rootCauseCategory?: string; resolutionNotes?: string }) => {
        const response = await api.patch(`/incidents/${id}/resolve`, data, {
            params: { orgId: ORG_ID },
        });
        return response.data;
    },

    // Update status
    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/incidents/${id}`, { status }, {
            params: { orgId: ORG_ID },
        });
        return response.data;
    },

    // Get audit trail
    getAuditTrail: async (id: string) => {
        const response = await api.get(`/incidents/${id}/audit-trail`, {
            params: { orgId: ORG_ID },
        });
        return response.data;
    },
};

// Analytics API
export const analyticsApi = {
    // Get SLA metrics
    getSLAMetrics: async (startDate?: string, endDate?: string) => {
        const params: any = { orgId: ORG_ID };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get('/analytics/sla', { params });
        return response.data;
    },

    // Get root cause stats
    getRootCauseStats: async (startDate?: string, endDate?: string) => {
        const params: any = { orgId: ORG_ID };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get('/analytics/root-causes', { params });
        return response.data;
    },

    // Get team performance
    getTeamPerformance: async (startDate?: string, endDate?: string) => {
        const params: any = { orgId: ORG_ID };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get('/analytics/team-performance', { params });
        return response.data;
    },

    // Get incident trend
    getIncidentTrend: async (days: number = 30) => {
        const response = await api.get('/analytics/trend', {
            params: { orgId: ORG_ID, days },
        });
        return response.data;
    },
};

// Remediation API
export const remediationApi = {
    // Analyze incident and get AI proposal
    analyzeIncident: async (incidentId: string) => {
        const response = await api.post(`/remediation/analyze/${incidentId}`);
        return response.data;
    },

    // Execute approved remediation
    executeRemediation: async (executionId: string, approvedBy?: string) => {
        const response = await api.post(`/remediation/execute/${executionId}`, {
            approvedBy,
        });
        return response.data;
    },

    // Reject remediation
    rejectRemediation: async (executionId: string, rejectedBy: string, reason?: string) => {
        const response = await api.post(`/remediation/reject/${executionId}`, {
            rejectedBy,
            reason,
        });
        return response.data;
    },

    // Rollback remediation
    rollbackRemediation: async (executionId: string, rolledBackBy: string) => {
        const response = await api.post(`/remediation/rollback/${executionId}`, {
            rolledBackBy,
        });
        return response.data;
    },

    // Get execution details
    getExecution: async (executionId: string) => {
        const response = await api.get(`/remediation/execution/${executionId}`);
        return response.data;
    },

    // Suggest playbook from resolution (AI Learning)
    suggestPlaybookFromResolution: async (incidentId: string) => {
        const response = await api.post(`/remediation/suggest-playbook/${incidentId}`);
        return response.data;
    },

    // Learn from resolution (Save playbook)
    learnFromResolution: async (
        incidentId: string,
        learnedBy: string,
        playbookData: {
            playbookName: string;
            description: string;
            steps: any[];
            triggerConditions: any;
        },
    ) => {
        const response = await api.post(`/remediation/learn/${incidentId}`, {
            learnedBy,
            ...playbookData,
        });
        return response.data;
    },

    // Get all playbooks
    getPlaybooks: async () => {
        const response = await api.get('/remediation/playbooks', {
            params: { orgId: ORG_ID },
        });
        return response.data;
    },

    // Provide feedback on playbook execution
    providePlaybookFeedback: async (
        playbookId: string,
        feedback: {
            outcome: 'success' | 'failure';
            notes: string;
            suggestedChanges?: any;
        },
    ) => {
        const response = await api.patch(`/remediation/playbook/${playbookId}/feedback`, feedback);
        return response.data;
    },
};

