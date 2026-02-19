"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentsController = void 0;
const common_1 = require("@nestjs/common");
const incidents_service_1 = require("./incidents.service");
const index_1 = require("./dto/index");
let IncidentsController = class IncidentsController {
    incidentsService;
    constructor(incidentsService) {
        this.incidentsService = incidentsService;
    }
    create(createIncidentDto) {
        return this.incidentsService.create(createIncidentDto);
    }
    findAll(allQuery) {
        const { orgId, ...queryParams } = allQuery;
        if (!orgId) {
            throw new common_1.BadRequestException('orgId query parameter is required');
        }
        return this.incidentsService.findAll(orgId, queryParams);
    }
    findOne(id, orgId) {
        if (!orgId) {
            throw new common_1.BadRequestException('orgId query parameter is required');
        }
        return this.incidentsService.findOne(id, orgId);
    }
    update(id, orgId, updateIncidentDto) {
        if (!orgId) {
            throw new common_1.BadRequestException('orgId query parameter is required');
        }
        return this.incidentsService.update(id, orgId, updateIncidentDto);
    }
    remove(id, orgId) {
        if (!orgId) {
            throw new common_1.BadRequestException('orgId query parameter is required');
        }
        return this.incidentsService.remove(id, orgId);
    }
};
exports.IncidentsController = IncidentsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [index_1.CreateIncidentDto]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('orgId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, index_1.UpdateIncidentDto]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "remove", null);
exports.IncidentsController = IncidentsController = __decorate([
    (0, common_1.Controller)('incidents'),
    __metadata("design:paramtypes", [incidents_service_1.IncidentsService])
], IncidentsController);
//# sourceMappingURL=incidents.controller.js.map