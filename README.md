# OpsPulse

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2020.0.0-blue.svg)](https://nodejs.org/)
[![NestJS Framework](https://img.shields.io/badge/framework-NestJS%20v11-red.svg)](https://nestjs.com/)
[![Next.js Frontend](https://img.shields.io/badge/frontend-Next.js%20v16-black.svg)](https://nextjs.org/)
[![Database PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-blue.svg)](https://www.postgresql.org/)
[![ORM Prisma](https://img.shields.io/badge/orm-Prisma%20v6-lightblue.svg)](https://www.prisma.io/)
[![AI Integration](https://img.shields.io/badge/AI-OpenAI%20GPT--4-purple.svg)](https://openai.com/)
[![License](https://img.shields.io/badge/license-UNLICENSED-gray.svg)](#)

OpsPulse is an enterprise-grade, multi-tenant, AI-augmented incident command center designed to optimize operational uptime. Modeled as a next-generation automated response platform, OpsPulse digests raw application alerts via webhooks, deduplicates cascading failures, dynamically delegates responsibility using SLA-aware escalation policies and on-call schedules, and generates automated, human-in-the-loop AI remediation playbooks.

---

## Overview

OpsPulse acts as the central intelligence engine for your DevOps and Site Reliability Engineering (SRE) teams. It bridges the gap between raw monitoring logs and active service recovery.

### The Problem It Solves
Modern cloud architectures emit millions of metrics and alerts. When systems fail, SREs face three key bottlenecks:
1. **Alert Fatigue:** Noise from cascading secondary errors masks the root cause of an outage.
2. **Delayed Escalation:** Manual coordination of on-call rotations and SLA tracking increases Mean Time to Acknowledge (MTTA).
3. **Execution Delay:** Figuring out the exact playbook steps to safely restore a database connection pool or roll back a bad deploy takes precious minutes.

### What OpsPulse Does
OpsPulse solves these issues by:
- **Deduplicating Alert Storms:** Using correlation keys to group related alerts under a single incident.
- **SLA-Aware Routing:** Querying active on-call rosters and automatically escalating to backup engineers if response timers expire.
- **AI-Synthesized Remediation:** Interacting with OpenAI's GPT-4 engine to evaluate alert metadata, compile structured execution steps (including HTTP checks, wait intervals, and notifications), run them upon human approval, and provide instant recovery rollback capability.

### Target Users
- **SRE & DevOps Engineers:** Seeking an automated command center to execute low-risk recovery playbooks with single-click confidence.
- **Engineering Managers & Directors:** Requiring real-time SLA metrics, root-cause categorization trends, and audit trail logs for post-mortem analysis.

---

## Features

- **⚡ Multi-Channel Alert Ingestion & Intelligent Triage:**
  - Secure incoming webhook endpoint `/webhooks/incidents` validated via cryptographic signatures.
  - Correlation-key-based deduplication preventing secondary event noise.
  - Heuristic-based severity classification classifying events from P1 (Critical) to P4 (Low).

- **🛡️ SLA-Driven Automated Escalation:**
  - Real-time SLA tracker running every 30 seconds checking acknowledge/resolve times.
  - Multi-level escalation policies routing to backup engineers upon SLA breach.
  - Automated omni-channel notifications utilizing Twilio (SMS/Voice), Slack, and SendGrid (Email).

- **🤖 AI-Powered Auto-Remediation Playbooks:**
  - Instantly generates SRE root-cause analysis and confidence scores using OpenAI GPT-4.
  - Compiles structured multi-step recovery plans (HTTP requests, conditions, timers, notifications).
  - High-fidelity human-in-the-loop approval gates before code execution.
  - Reverse-order execution engine for one-click manual rollbacks.
  - "Learn-from-Resolution" feature: Converts manual resolution notes into reusable automation playbooks via GPT-4.

- **📊 Comprehensive Analytics & Operations Reporting:**
  - Interactive dashboards built with Next.js 16 and Recharts showing SLA adherence.
  - Historical root-cause distribution analysis.
  - On-demand CSV report exports for SLA compliance and team metrics.
  - Immutable, detailed incident audit logs tracking every event, state transition, and actor.

---

## Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | Next.js 16.1.6, React 19.2.3, TypeScript, TailwindCSS v4 | Modern, glassmorphic UI built with strict type safety, responsive CSS gradients, and fluid micro-animations. |
| **Backend** | NestJS v11.0.1, Express, TypeScript | Highly modular, scalable backend utilizing dependency injection, guards, pipes, and interceptors. |
| **Database & ORM** | PostgreSQL, Prisma Client v6.19.2 | Relational schema with index optimization for query speed under high alert load. |
| **Authentication** | Passport, Passport-JWT, Bcrypt | Secure, stateless JSON Web Tokens for authentication and password hashing. |
| **AI Integration** | OpenAI SDK (GPT-4 Model) | Synthesizes root-cause analyses, predicts auto-remediation safety, and builds playbooks. |
| **Infrastructure** | Twilio API, Slack Web API, SendGrid Mail | Communications engine routing alerts to SMS/Voice, Slack channels, and Email. |
| **Testing** | Jest, Supertest, TS-Jest | Unit testing suite and End-to-End API endpoint validation. |
| **Other Tools** | `json2csv`, `lucide-react`, `recharts` | Data serialization, premium iconography, and interactive charts. |

---

## Architecture

OpsPulse is built on a decoupled **Client-Server Architecture** utilizing a multi-tenant design:

```mermaid
graph TD
    A[Monitoring System / Prometheus / Datadog] -->|Secure Signed Webhook| B(NestJS Gateway)
    B -->|Verify Signature & Decode| C{Deduplication Service}
    C -->|Duplicate Found| D[Append Event to Existing Incident]
    C -->|New Alert| E[Severity Classifier]
    E --> F[Fetch On-Call Schedule]
    F --> G[Create Incident in DB]
    G --> H[Notify via Slack/SMS/Email]
    
    I[Next.js Frontend] -->|REST API Request| B
    B -->|Query / Mutate| J[(PostgreSQL via Prisma)]
    
    G -->|Trigger SLA Cron| K[SLA Tracker Service]
    K -->|Breach Detected| L[Escalation Service]
    L -->|Update Assigned User| G
    
    M[OpenAI GPT-4] <-->|Analyze Context| N[AI Analyzer Service]
    N -->|Generate Playbook Steps| O[Remediation Execution Engine]
    O -->|Manual Approval Gate| I
```

### Major Components
1. **Webhooks Ingress (`/webhooks`):** Ingests external alert payloads. Secures input using `WebhookSignatureGuard` (HMAC SHA-256).
2. **SLA & Escalation Core (`/webhooks/services`):** Tracks timers continuously. Evaluates escalation levels from JSON-configured escalation policies.
3. **Remediation Orchestrator (`/remediation`):** Connects to OpenAI for analysis. Coordinates with the `ExecutionEngineService` to sequentially process and log playbook steps.
4. **Analytics & Exports (`/analytics`):** Computes team response performance and formats CSV binary payloads on the fly.

---

## Project Structure

```
opspulse/
├── backend/
│   ├── prisma/
│   │   ├── migrations/             # Database migration history
│   │   ├── schema.prisma            # PostgreSQL Database Schema definition
│   │   └── seed.ts                  # Database seeding script (mock org, users, incidents)
│   ├── src/
│   │   ├── analytics/              # SLA, performance metrics, and CSV reporting
│   │   ├── audit/                  # Log mutations in an immutable audit trail
│   │   ├── incidents/              # Main incident retrieval & lifecycle modification
│   │   ├── notifications/          # Modular channels: Email (SendGrid), Slack, SMS (Twilio)
│   │   ├── prisma/                 # Prisma database connection client module
│   │   ├── remediation/            # OpenAI integration, execution engine, rollback systems
│   │   ├── webhooks/               # Webhook ingestion, signature verification, SLA, and escalations
│   │   ├── app.module.ts           # Main application module importing all features
│   │   └── main.ts                 # Application bootstrapping and pipe initialization
│   ├── test/                       # Jest end-to-end integration tests
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/                    # Next.js Pages Router (globals.css, home, analytics, incidents)
    │   ├── components/             # Reusable UI elements (cards, navigation components, glass panes)
    │   ├── lib/                    # Axios API clients for backend service interaction
    │   └── types/                  # Shared TypeScript interfaces
    └── package.json
```

---

## Screenshots / Demo

*Premium interactive UI screenshots displaying dark-mode glassmorphic layouts, live charts, and incident detail dashboards:*

| Dashboard Overview | AI Remediation Proposal |
| :---: | :---: |
| ![Dashboard Mockup](https://raw.githubusercontent.com/Tanmay-Awal/opspulse/main/assets/dashboard_preview.png) | ![Remediation Mockup](https://raw.githubusercontent.com/Tanmay-Awal/opspulse/main/assets/remediation_preview.png) |

---

## Getting Started

### Prerequisites
- **Node.js** `>= 20.0.0`
- **npm** `>= 10.0.0`
- **PostgreSQL Database** (local or hosted instance)
- **OpenAI API Key** (for remediation analysis features)

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Tanmay-Awal/opspulse.git
   cd opspulse
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory based on the environment table below. Then run migrations and seed the database:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory based on the environment table below.

### Environment Variables

#### Backend Environment Variables (`backend/.env`)

| Variable | Description | Required | Default |
|:---|:---|:---:|:---|
| `DATABASE_URL` | PostgreSQL connection string | **Yes** | `postgresql://opspulse:devpassword123@localhost:5432/opspulse_dev` |
| `JWT_SECRET` | Secret key for signing web tokens | **Yes** | `your-super-secret-jwt-key` |
| `APP_BASE_URL` | Base URL of the client application | No | `http://localhost:3000` |
| `OPENAI_API_KEY` | Key for GPT-4 analysis & playbook recommendations | **Yes** | - |
| `SLACK_WEBHOOK_URL` | Outbound webhook for posting alert channels | No | - |
| `SLACK_BOT_TOKEN` | Token for Slack Bot API calls | No | - |
| `TWILIO_ENABLED` | Toggles twilio notifications on/off | No | `false` |
| `TWILIO_ACCOUNT_SID`| Twilio Account Identifier | No | - |
| `TWILIO_AUTH_TOKEN` | Twilio Authentication token | No | - |
| `TWILIO_PHONE_NUMBER`| Registered Twilio phone number | No | - |
| `SENDGRID_API_KEY` | SendGrid Mail API Key | No | - |
| `SENDGRID_FROM_EMAIL`| Verified sender address for alerts | No | - |
| `SENDGRID_FROM_NAME` | Name displayed in alert emails | No | `OpsPulse Alerts` |
| `ORG_ID` | Seeding Default Organization Identifier | **Yes** | `aa21fc63-4888-48e5-bfd0-2cb9ed7bbdad` |

#### Frontend Environment Variables (`frontend/.env`)

| Variable | Description | Required | Default |
|:---|:---|:---:|:---|
| `NEXT_PUBLIC_API_URL` | NestJS Backend host endpoint | **Yes** | `http://localhost:3001` |
| `NEXT_PUBLIC_ORG_ID`  | Active organization uuid context | **Yes** | `aa21fc63-4888-48e5-bfd0-2cb9ed7bbdad` |

### Running Locally

1. **Start the Backend Server (runs on Port 3001 or as configured):**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Start the Frontend Application (runs on Port 3000):**
   ```bash
   cd ../frontend
   npm run dev
   ```

---

## API Documentation

### Base URL
`http://localhost:3001` (or local config)

### Authentication
Endpoints require JWT validation. Include the authorization header:
`Authorization: Bearer <token>`
*(Note: For demonstration and developer onboarding, the default routes extract `orgId` from route query parameters).*

### Major Endpoints

#### 1. Ingest Incident Alerts
* **URL:** `POST /webhooks/incidents`
* **Headers:** `X-OpsPulse-Signature: sha256=<hmac-signature>`
* **Request Body:**
  ```json
  {
    "source": "prometheus",
    "type": "database_connection_failure",
    "severity": "critical",
    "message": "Connection timeout on port 5432 after 10000ms",
    "correlationKey": "db_conn_err_prod_01",
    "idempotencyKey": "unique-uuid-key-here",
    "metadata": {
      "host": "prod-db-replica-01",
      "active_connections": 1500
    }
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "action": "created",
    "incidentId": "d04a6015-7798-46cc-9430-c8c3664d5ca9",
    "priority": "p1_critical",
    "assignedTo": "engineer-uuid-here",
    "message": "New incident created: [prometheus] database connection failure..."
  }
  ```

#### 2. Analyze & Propose AI Remediation
* **URL:** `POST /remediation/analyze/:incidentId`
* **Response (201 Created):**
  ```json
  {
    "hasPlaybook": true,
    "executionId": "87fb7e6c-7bd9-4fb5-bb79-1f488665ea28",
    "playbook": {
      "id": "playbook-uuid-here",
      "name": "Restart Database Connection Pool",
      "description": "Safe recycle of database connections"
    },
    "aiAnalysis": {
      "analysis": "Database connection pool saturated by orphaned threads on host replica-01.",
      "severity": "critical",
      "suggestedActions": ["Trigger database pool restart HTTP hook"],
      "confidence": 92,
      "canAutoRemediate": true,
      "reasoning": "Standard connection saturation error matches safe recycle procedure."
    },
    "remediationPlan": {
      "plan": "Recycle database connection pool endpoints sequentially.",
      "steps": [
        { "stepNumber": 1, "action": "Trigger pool reset webhook", "expectedOutcome": "Status 200 OK", "risk": "medium" }
      ],
      "estimatedTime": "15s",
      "confidence": 90,
      "warnings": ["Active transactions will be aborted"]
    },
    "matchConfidence": 95,
    "overallConfidence": 91
  }
  ```

#### 3. Execute Remediation Plan
* **URL:** `POST /remediation/execute/:executionId`
* **Request Body:**
  ```json
  {
    "approvedBy": "engineer@opspulse.io"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "executionId": "87fb7e6c-7bd9-4fb5-bb79-1f488665ea28",
    "status": "completed"
  }
  ```

---

## Database

OpsPulse uses **PostgreSQL** configured via the **Prisma ORM**. Below are the primary entities and structural associations:

### Main Entities
* **Organization (`organizations`):** The root tenant. Defines the custom `webhookSecret` for incoming hooks and the billing plan tier.
* **User (`users`):** Engineers belonging to an organization. Maps to Slack identifiers and phone numbers used by alerting channels.
* **Incident (`incidents`):** Holds status state (`open`, `acknowledged`, `resolved`), priorities (`p1_critical` to `p4_low`), ownership details, and Root Cause metrics.
* **IncidentEvent (`incident_events`):** Raw logs database containing historical alert counts. Links multiple deduplicated occurrences to a parent Incident.
* **RemediationPlaybook (`remediation_playbooks`):** Pre-configured trigger conditions and step instructions (in JSON array format) applied to incoming matching incidents.
* **RemediationExecution (`remediation_executions`):** Tracks the lifecycle of a single playbook execution, documenting human approval, confidence metrics, and OpenAI-synthesized details.
* **AuditLog (`audit_logs`):** Write-once database logging all platform state changes.

---

## Testing

The backend uses **Jest** to run unit and integration suites. 

* Run Unit Tests:
  ```bash
  npm run test
  ```
* Run E2E Integration Tests (Validates whole app endpoints via Nest modules):
  ```bash
  npm run test:e2e
  ```
* View Test Coverage:
  ```bash
  npm run test:cov
  ```

---

## Deployment

### Production Strategy
1. **Database Provisioning:** Deploy a PostgreSQL cluster (Amazon RDS, Supabase, etc.) and run Prisma Migrations:
   ```bash
   npx prisma migrate deploy
   ```
2. **Server Compilation:** Build the NestJS distribution output:
   ```bash
   npm run build
   ```
   Deploy the compiled `dist/main.js` to cloud providers like Heroku, AWS Elastic Beanstalk, or render using standard Node production configurations:
   ```bash
   npm run start:prod
   ```
3. **Frontend Compilation:** Compile the Next.js static production bundle:
   ```bash
   npm run build
   npm run start
   ```

---

## Security

OpsPulse enforces enterprise-grade security protocols:
* **Webhook Signature Verification:** The `WebhookSignatureGuard` calculates an HMAC SHA-256 hash of the request body using the organization's unique secret key. Any webhook lacking a valid signature headers match is immediately rejected.
* **Stateless Authorization:** Protects critical operations using JSON Web Tokens (JWT) via Passport strategies.
* **Safe Playbook Execution:** Playbook HTTP steps are routed through a demo simulation wrapper. In production configurations, outbound playbook integrations are bound to a strictly defined domain whitelist.
* **Auditability:** Immutable database entries record all modifications to incidents, preventing unauthorized modification of SLA logs.

---

## Performance Considerations

* **Deduplication at Ingress:** Eliminates duplicate database writes by updating existing incidents rather than creating fresh records, conserving write-locks on tables.
* **Indexed Queries:** Relational indices configured on frequently queried columns (`status`, `createdAt`, `assignedTo`, `timestamp`) reduce search overhead for live dashboards.
* **Asynchronous Alert Routing:** Notification alerts to Twilio/Slack/Email run in background tasks (`await` is handled gracefully without blocking the HTTP request-response flow of webhooks).

---

## Challenges & Engineering Decisions

### 1. Alert Noise vs. Deduplication Speed
* *Challenge:* Under network split scenarios, monitoring tools throw hundreds of identical alerts within seconds.
* *Decision:* Evaluated checking database history in memory vs Prisma lookups. Implemented a unique index combination (`orgId`, `correlationKey`) coupled with a fast pre-flight check in the Deduplication Service, preventing DB connection limits from bottlenecking.

### 2. Safeguarding AI Remediation Actionability
* *Challenge:* Raw GPT-4 outputs can hallucinate parameters or generate loose structures that break parsing steps.
* *Decision:* Implemented `response_format: { type: "json_object" }` alongside rigid typescript validations. In case of API failure, the execution engine switches to a secure default notification playbook template, guaranteeing uptime.

---

## Future Improvements

- [ ] **Grafana & Datadog Native Integrations:** Create custom exporters and preset dashboard dashboards.
- [ ] **Kubernetes Operator:** Run remediation actions directly via internal container cluster sidecars.
- [ ] **Active Voice Escalation:** Add Twilio Interactive Voice Response (IVR) allowing engineers to acknowledge or escalate alerts directly via a phone call keypress.

---

## Contributing

1. Fork the Repository.
2. Create your Feature Branch: `git checkout -b feature/NewRemediationChannel`
3. Commit your changes: `git commit -m 'Add custom MS Teams notification channel'`
4. Push to the branch: `git push origin feature/NewRemediationChannel`
5. Open a Pull Request.

---

## License

This project is licensed under the terms of the **UNLICENSED** developer agreement. All rights reserved.

---

## Author

**Tanmay Awal**
* [GitHub Profile](https://github.com/Tanmay-Awal)
* [Portfolio Website](https://tanmay-portfolio-flame.vercel.app/)
