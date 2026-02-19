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
exports.CreateIncidentDto = exports.IncidentStatus = exports.IncidentPriority = void 0;
const class_validator_1 = require("class-validator");
var IncidentPriority;
(function (IncidentPriority) {
    IncidentPriority["P1_CRITICAL"] = "p1_critical";
    IncidentPriority["P2_HIGH"] = "p2_high";
    IncidentPriority["P3_MEDIUM"] = "p3_medium";
    IncidentPriority["P4_LOW"] = "p4_low";
})(IncidentPriority || (exports.IncidentPriority = IncidentPriority = {}));
var IncidentStatus;
(function (IncidentStatus) {
    IncidentStatus["OPEN"] = "open";
    IncidentStatus["ACKNOWLEDGED"] = "acknowledged";
    IncidentStatus["INVESTIGATING"] = "investigating";
    IncidentStatus["RESOLVED"] = "resolved";
    IncidentStatus["CLOSED"] = "closed";
})(IncidentStatus || (exports.IncidentStatus = IncidentStatus = {}));
class CreateIncidentDto {
    orgId;
    source;
    eventType;
    title;
    priority;
    assignedTo;
    metadata;
}
exports.CreateIncidentDto = CreateIncidentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "orgId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "eventType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(IncidentPriority),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "assignedTo", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateIncidentDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-incident.dto.js.map