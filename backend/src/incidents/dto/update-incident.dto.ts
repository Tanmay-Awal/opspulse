import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IncidentStatus } from './create-incident.dto';

export class UpdateIncidentDto {
    @IsEnum(IncidentStatus)
    @IsOptional()
    status?: IncidentStatus;

    @IsString()
    @IsOptional()
    assignedTo?: string;

    @IsString()
    @IsOptional()
    rootCauseCategory?: string;

    @IsString()
    @IsOptional()
    resolutionNotes?: string;
}