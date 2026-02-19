import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IncidentStatus, IncidentPriority } from './create-incident.dto';

export class QueryIncidentsDto {
    @IsOptional()
    @IsEnum(IncidentStatus)
    status?: IncidentStatus;

    @IsOptional()
    @IsEnum(IncidentPriority)
    priority?: IncidentPriority;

    @IsOptional()
    @IsString()
    assignedTo?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;
}