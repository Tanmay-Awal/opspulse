import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        // Get signature from header
        const signature = request.headers['x-opspulse-signature'] as string;

        if (!signature) {
            throw new UnauthorizedException('Missing X-OpsPulse-Signature header');
        }

        // Get org ID from request body (it should be in the payload)
        const body = request.body;
        const orgId = body.orgId;

        if (!orgId) {
            throw new BadRequestException('Missing orgId in request body');
        }

        // Fetch organization's webhook secret
        const org = await this.prisma.organization.findUnique({
            where: { id: orgId },
            select: { webhookSecret: true },
        });

        if (!org) {
            throw new UnauthorizedException('Invalid organization');
        }

        // Compute expected signature
        const rawBody = JSON.stringify(body);
        const expectedSignature = crypto
            .createHmac('sha256', org.webhookSecret)
            .update(rawBody)
            .digest('hex');

        const providedSignature = signature.replace('sha256=', '');

        // Constant-time comparison to prevent timing attacks
        if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature))) {
            throw new UnauthorizedException('Invalid signature');
        }

        console.log('✅ Webhook signature validated');
        return true;
    }
}