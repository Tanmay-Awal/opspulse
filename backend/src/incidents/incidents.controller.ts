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
}