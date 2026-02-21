const crypto = require('crypto');

// Your org's webhook secret (from seed data)
const WEBHOOK_SECRET = 'test-secret-change-in-production';
const ORG_ID = 'aa21fc63-4888-48e5-bfd0-2cb9ed7bbdad'; // Replace with your actual org ID

// Test payload
const payload = {
    orgId: ORG_ID,
    source: 'api-service-prod',
    type: 'database_error',
    severity: 'critical',
    message: 'Connection pool exhausted - 20/20 connections in use',
    timestamp: new Date().toISOString(),
    correlationKey: 'db-prod-pool-1',
    metadata: {
        service: 'user-authentication',
        error_count: 45,
        duration_seconds: 120
    }
};

// Generate HMAC signature
const payloadString = JSON.stringify(payload);
const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payloadString)
    .digest('hex');

console.log('=== WEBHOOK TEST PAYLOAD ===\n');
console.log('Headers:');
console.log(`X-OpsPulse-Signature: sha256=${signature}`);
console.log(`Content-Type: application/json`);
console.log('\nBody:');
console.log(JSON.stringify(payload, null, 2));
console.log('\n=== CURL COMMAND ===\n');

const curlCommand = `curl -X POST http://localhost:3000/webhooks/incidents -H "Content-Type: application/json" -H "X-OpsPulse-Signature: sha256=${signature}" -d "${payloadString.replace(/"/g, '\\"')}"`;

console.log(curlCommand);