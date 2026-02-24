import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
    UsePipes,
    ValidationPipe,
    BadRequestException,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto, UpdateIncidentDto, QueryIncidentsDto } from './dto/index';

@Controller('incidents')
export class IncidentsController {
    constructor(private readonly incidentsService: IncidentsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createIncidentDto: CreateIncidentDto) {
        return this.incidentsService.create(createIncidentDto);
    }

    @Get()
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }))
    findAll(@Query() allQuery: any) {
        const { orgId, ...queryParams } = allQuery;

        if (!orgId) {
            throw new BadRequestException('orgId query parameter is required');
        }

        return this.incidentsService.findAll(orgId, queryParams as QueryIncidentsDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Query('orgId') orgId: string) {
        if (!orgId) {
            throw new BadRequestException('orgId query parameter is required');
        }

        return this.incidentsService.findOne(id, orgId);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Query('orgId') orgId: string,
        @Body() updateIncidentDto: UpdateIncidentDto,
    ) {
        if (!orgId) {
            throw new BadRequestException('orgId query parameter is required');
        }

        return this.incidentsService.update(id, orgId, updateIncidentDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string, @Query('orgId') orgId: string) {
        if (!orgId) {
            throw new BadRequestException('orgId query parameter is required');
        }

        return this.incidentsService.remove(id, orgId);
    }
    /**
   * PATCH /incidents/:id/acknowledge?orgId=xxx
   * Acknowledge an incident
   */
    @Patch(':id/acknowledge')
    async acknowledge(
        @Param('id') id: string,
        @Query('orgId') orgId: string,
    ) {
        if (!orgId) {
            throw new BadRequestException('orgId query parameter is required');
        }

        return this.incidentsService.acknowledge(id, orgId);
    }

    /**
     * PATCH /incidents/:id/resolve?orgId=xxx
     * Resolve an incident
     */
    @Patch(':id/resolve')
    async resolve(
        @Param('id') id: string,
        @Query('orgId') orgId: string,
        @Body() resolveData: { rootCauseCategory?: string; resolutionNotes?: string },
    ) {
        if (!orgId) {
            throw new BadRequestException('orgId query parameter is required');
        }

        return this.incidentsService.resolve(id, orgId, resolveData);
    }

    /**
   * GET /incidents/:id/audit-trail?orgId=xxx
   * Get full audit trail for an incident
   */
    @Get(':id/audit-trail')
    async getAuditTrail(
        @Param('id') id: string,
        @Query('orgId') orgId: string,
    ) {
        if (!orgId) {
            throw new BadRequestException('orgId query parameter is required');
        }

        // Verify incident belongs to org
        await this.incidentsService.findOne(id, orgId);

        // Get audit logs
        const auditService = this.incidentsService['auditService'];
        return auditService.getIncidentAuditTrail(id);
    }
}