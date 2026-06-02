-- CreateTable
CREATE TABLE "remediation_playbooks" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger_conditions" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remediation_playbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remediation_executions" (
    "id" TEXT NOT NULL,
    "incident_id" TEXT NOT NULL,
    "playbook_id" TEXT,
    "triggered_by" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "ai_analysis" TEXT,
    "ai_plan" TEXT,
    "execution_log" JSONB,
    "confidence_score" DOUBLE PRECISION,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejected_by" TEXT,
    "rejected_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "remediation_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remediation_step_logs" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "step_index" INTEGER NOT NULL,
    "step_type" TEXT NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "duration_ms" INTEGER,
    "error" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "remediation_step_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playbook_feedback" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "feedback_note" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playbook_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "remediation_playbooks_org_id_idx" ON "remediation_playbooks"("org_id");

-- CreateIndex
CREATE INDEX "remediation_playbooks_is_active_idx" ON "remediation_playbooks"("is_active");

-- CreateIndex
CREATE INDEX "remediation_executions_incident_id_idx" ON "remediation_executions"("incident_id");

-- CreateIndex
CREATE INDEX "remediation_executions_status_idx" ON "remediation_executions"("status");

-- CreateIndex
CREATE INDEX "remediation_step_logs_execution_id_idx" ON "remediation_step_logs"("execution_id");

-- CreateIndex
CREATE INDEX "playbook_feedback_execution_id_idx" ON "playbook_feedback"("execution_id");

-- AddForeignKey
ALTER TABLE "remediation_playbooks" ADD CONSTRAINT "remediation_playbooks_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
