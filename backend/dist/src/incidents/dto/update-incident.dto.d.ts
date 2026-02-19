import { IncidentStatus } from './create-incident.dto';
export declare class UpdateIncidentDto {
    status?: IncidentStatus;
    assignedTo?: string;
    rootCauseCategory?: string;
    resolutionNotes?: string;
}
