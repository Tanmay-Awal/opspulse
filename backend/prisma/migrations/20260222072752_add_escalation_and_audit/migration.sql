-- CreateTable
CREATE TABLE "escalation_policies" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "team_name" TEXT NOT NULL,
    "levels" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escalation_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "incident_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_email" TEXT,
    "from_value" JSONB,
    "to_value" JSONB,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_jobs" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "headers" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 6,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "next_retry_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "webhook_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "escalation_policies_org_id_idx" ON "escalation_policies"("org_id");

-- CreateIndex
CREATE INDEX "audit_logs_incident_id_idx" ON "audit_logs"("incident_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "webhook_jobs_status_next_retry_at_idx" ON "webhook_jobs"("status", "next_retry_at");

-- AddForeignKey
ALTER TABLE "escalation_policies" ADD CONSTRAINT "escalation_policies_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
