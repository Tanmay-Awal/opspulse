import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// For demo, we'll hardcode the org ID
// In production, this would come from user session
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || 'YOUR_ORG_ID_HERE';

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
        const response = await api.patch(`/incidents/${id}/acknowledge`, null, {
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