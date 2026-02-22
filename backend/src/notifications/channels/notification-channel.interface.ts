export interface NotificationPayload {
    incidentId: string;
    title: string;
    priority: string;
    status: string;
    message: string;
    assignedTo?: string;
    acknowledgeUrl: string;
    viewUrl: string;
}

export interface NotificationResult {
    success: boolean;
    channel: string;
    messageId?: string;
    error?: string;
    deliveredAt?: Date;
}

export interface NotificationChannel {
    name: string;
    send(recipient: any, payload: NotificationPayload): Promise<NotificationResult>;
}