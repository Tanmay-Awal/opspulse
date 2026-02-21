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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingWebhookDto = exports.WebhookSeverity = exports.WebhookEventType = void 0;
const class_validator_1 = require("class-validator");
var WebhookEventType;
(function (WebhookEventType) {
    WebhookEventType["DATABASE_ERROR"] = "database_error";
    WebhookEventType["CRON_FAILURE"] = "cron_failure";
    WebhookEventType["API_ERROR"] = "api_error";
    WebhookEventType["WEBHOOK_FAILURE"] = "webhook_failure";
    WebhookEventType["DEPLOYMENT_FAILED"] = "deployment_failed";
    WebhookEventType["HIGH_MEMORY"] = "high_memory";
    WebhookEventType["HIGH_CPU"] = "high_cpu";
    WebhookEventType["DISK_FULL"] = "disk_full";
})(WebhookEventType || (exports.WebhookEventType = WebhookEventType = {}));
var WebhookSeverity;
(function (WebhookSeverity) {
    WebhookSeverity["CRITICAL"] = "critical";
    WebhookSeverity["HIGH"] = "high";
    WebhookSeverity["MEDIUM"] = "medium";
    WebhookSeverity["LOW"] = "low";
})(WebhookSeverity || (exports.WebhookSeverity = WebhookSeverity = {}));
class IncomingWebhookDto {
    orgId;
    source;
    type;
    severity;
    message;
    timestamp;
    idempotencyKey;
    correlationKey;
    metadata;
}
exports.IncomingWebhookDto = IncomingWebhookDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IncomingWebhookDto.prototype, "orgId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IncomingWebhookDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(WebhookEventType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IncomingWebhookDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(WebhookSeverity),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IncomingWebhookDto.prototype, "severity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IncomingWebhookDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IncomingWebhookDto.prototype, "timestamp", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IncomingWebhookDto.prototype, "idempotencyKey", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IncomingWebhookDto.prototype, "correlationKey", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], IncomingWebhookDto.prototype, "metadata", void 0);
//# sourceMappingURL=incoming-webhook.dto.js.map