import { IncidentStatus, IncidentPriority } from './create-incident.dto';
export declare class QueryIncidentsDto {
    status?: IncidentStatus;
    priority?: IncidentPriority;
    assignedTo?: string;
    page?: number;
    limit?: number;
}
