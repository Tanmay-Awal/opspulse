const crypto = require('crypto');

const WEBHOOK_SECRET = 'test-secret-change-in-production';
const ORG_ID = 'aa21fc63-4888-48e5-bfd0-2cb9ed7bbdad'; // Same org ID

const payload = {
    orgId: ORG_ID,
    source: 'cron-scheduler',
    type: 'cron_failure',
    severity: 'high',
    message: 'Daily backup job failed after 3 retries',
    timestamp: new Date().toISOString(),
    metadata: {
        job_name: 'daily-db-backup',
        last_success: '2026-02-18T03:00:00Z',
        error: 'S3 bucket permission denied'
    }
};

const payloadString = JSON.stringify(payload);
const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payloadString)
    .digest('hex');

const curlCommand = `curl -X POST http://localhost:3000/webhooks/incidents -H "Content-Type: application/json" -H "X-OpsPulse-Signature: sha256=${signature}" -d "${payloadString.replace(/"/g, '\\"')}"`;

console.log(curlCommand);