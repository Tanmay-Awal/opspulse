"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const incidents_module_1 = require("./incidents/incidents.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
const notifications_module_1 = require("./notifications/notifications.module");
const audit_module_1 = require("./audit/audit.module");
const escalation_service_1 = require("./webhooks/services/escalation.service");
const schedule_1 = require("@nestjs/schedule");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            incidents_module_1.IncidentsModule,
            webhooks_module_1.WebhooksModule,
            notifications_module_1.NotificationsModule,
            audit_module_1.AuditModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, escalation_service_1.EscalationService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map