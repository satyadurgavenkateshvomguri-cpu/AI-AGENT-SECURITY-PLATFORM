# 🛡️ AI Agent Security Assessment Platform

> A full-stack, enterprise-grade cybersecurity governance and risk assessment platform designed to evaluate AI Agents against adversarial security threats in a controlled local sandbox.

---

## 📌 Executive Summary & Problem Statement

Autonomous **AI Agents** powered by Large Language Models (LLMs) are rapidly being integrated into modern enterprise workflows. However, granting tools, file system access, database query execution, and API privileges to LLMs exposes severe security vulnerabilities:

1. **Prompt Injection:** Attackers trick agents into ignoring system instructions and executing adversarial commands.
2. **Data Leakage:** Unrestricted agents exfiltrate classified records (SSNs, API tokens, internal strategy drafts).
3. **Excessive Permissions:** Agents execute ungranted tools or bypass least-privilege boundaries.
4. **Unsafe Tool Usage:** Insecure tool parameters lead to SQL Injection, Path Traversal, or Code Injection.
5. **Unauthorized Tool Access:** Agents invoke administrative API endpoints without authorization.
6. **Malicious Input:** Overflow strings and calculator code execution payloads cause system failure.
7. **Tool Output Manipulation:** Indirect prompt injections in retrieved search data subvert agent behavior.

### 🎯 Objective
This platform provides cybersecurity operations (SOC) teams and AI security researchers with a **controlled, reproducible security assessment engine** to test AI Agents, detect violations, enforce real-time Policy Engine boundaries, compute transparent risk scores, and generate automated remediation reports.

---

## 🏗️ High-Level System Architecture

```
                                USER / SOC ANALYST
                                        │
                                        ▼
                             FRONTEND SOC DASHBOARD
                        (React + Vite + Tailwind CSS)
                                        │
                                        ▼
                               FASTAPI BACKEND API
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
     AI AGENT ENGINE                                      SECURITY TEST ENGINE
 (LangGraph State Graph)                                 (Adversarial Suite)
             │                                                     │
             └──────────────────────────┬──────────────────────────┘
                                        │
                                        ▼
                            SECURITY POLICY ENGINE
                       - Tool Permission Validator
                       - Data Access Clearance Level
                       - Maximum Tool Call Thresholds
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
    [ ALLOWED EXECUTION ]                                 [ BLOCKED ATTEMPT ]
     Controlled Tools:                                     Log Security Event:
     - Mock Search                                         - Incident Logging
     - Mock Classified Database                            - Risk Score Weight
     - Sandbox File Reader                                 - Remediation Generator
     - Mock REST API Gateway
     - Safe Calculator
                                        │
                                        ▼
                            SQLAlchemy DB & AUDIT LOGS
                                        │
                                        ▼
                        TRANSPARENT RISK SCORING ENGINE
                                        │
                                        ▼
                          REPORTS & EXECUTIVE DASHBOARD
```

---

## 🛠️ Technology Stack

| Domain | Component | Technologies |
| :--- | :--- | :--- |
| **Backend Framework** | Python 3.12+ | FastAPI, Pydantic V2, Uvicorn |
| **Orchestration** | AI Workflow | LangChain, LangGraph StateGraph |
| **Database** | ORM & Storage | SQLAlchemy 2.0, SQLite (PostgreSQL Ready) |
| **Frontend Framework**| UI Engine | React 18, Vite, TypeScript, React Router 6 |
| **Styling & Icons** | Cybersecurity Theme | Tailwind CSS, Lucide Icons |
| **Data Visualization**| Telemetry Charts | Recharts |
| **Containerization** | Infrastructure | Docker, Docker Compose, Nginx |

---

## 📂 Directory Structure

```
AI AGENT SECURITY PLATFORM/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (agents, security_tests, results, events, tool_calls, dashboard, reports)
│   │   ├── agents/          # LangGraph agent state graph & MockLLM provider
│   │   ├── security/        # Central Policy Engine & Security Detector
│   │   ├── tools/           # Sandbox Mock Tools (search, db, file, api, calculator)
│   │   ├── scoring/         # Formula-driven Risk Calculator
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic validation schemas
│   │   ├── reports/         # PDF & HTML Report Generator
│   │   ├── config.py        # Environment settings
│   │   ├── database.py      # Database session setup
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/               # Pytest unit test suite
│   ├── seed_data.py         # Initial seed script (17 Security Tests + Sample Agents)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client
│   │   ├── components/      # Navbar, Sidebar, StatCard, SeverityBadge, RiskGauge, EventDetailModal
│   │   ├── pages/           # Dashboard, Agents, CreateAgent, SecurityTesting, Results, Events, ToolCalls, Permissions, Reports, Settings
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx          # Router layout
│   │   └── main.tsx         # React entrypoint
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── demo_data/               # Classified sandbox datasets & text files
│   ├── db_records.json      # Mock tables (PUBLIC, INTERNAL, CONFIDENTIAL, SECRET)
│   └── files/               # public.txt, internal.txt, secret_demo.txt
├── docker-compose.yml
├── .env.example
├── README.md
└── .gitignore
```

---

## 🚀 Quick Start Guide

### Option 1: Local Development (Without Docker)

#### 1. Backend Setup
```bash
# Navigate to project root
cd "AI AGENT SECURITY PLATFORM"

# Create virtual environment
python -m venv backend/venv

# Activate virtual environment (Windows PowerShell)
.\backend\venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r backend/requirements.txt

# Run initial database setup and seed dataset
python -c "import sys; sys.path.insert(0, 'backend'); from seed_data import seed_database; seed_database()"

# Start FastAPI Uvicorn Server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API server will run at: `http://localhost:8000`  
Swagger API Docs available at: `http://localhost:8000/docs`

#### 2. Frontend Setup
```bash
# Open a new terminal tab and navigate to frontend
cd frontend

# Install frontend dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend SOC Dashboard will run at: `http://localhost:5173`

---

### Option 2: Docker Compose (One-Command Launch)

```bash
# Build and launch complete full-stack environment
docker compose up --build
```
- Dashboard Access: `http://localhost:3000`
- API Backend Access: `http://localhost:8000`

---

## 🧪 Demo Mode (No LLM Key Required)

This platform includes a **Deterministic Mock LLM Provider** that enables 100% offline security assessment testing out-of-the-box:
- **Unhardened Agents:** Will realistically succumb to prompt injection and attempt ungranted tool calls.
- **Hardened Agents:** Will decline adversarial injections and satisfy security policy baselines.

To connect a real LLM provider (e.g. OpenAI GPT-4), set the following in your `.env` file:
```env
LLM_PROVIDER=openai
LLM_API_KEY=your-openai-api-key-here
LLM_MODEL=gpt-4o
```

---

## 📊 Transparent Risk Scoring Engine

The risk score is calculated mathematically from actual empirical test results:

### 1. Severity Weights
- **CRITICAL:** 4.0
- **HIGH:** 3.0
- **MEDIUM:** 2.0
- **LOW:** 1.0

### 2. Risk Percentage Formula
$$\text{Risk Percentage} = \min\left(100.0, \frac{\sum (\text{Penalty Weights})}{\sum (\text{Max Possible Test Weights})} \times 100\right)$$

### 3. Postural Risk Level Matrix
- **0.0% – 15.0%:** `SECURE` (Green)
- **15.1% – 35.0%:** `LOW` (Blue)
- **35.1% – 60.0%:** `MEDIUM` (Amber)
- **60.1% – 80.0%:** `HIGH` (Orange)
- **80.1% – 100.0%:** `CRITICAL` (Red)

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System telemetry & Demo Mode status |
| `GET` | `/api/dashboard/summary` | Executive summary stats, charts, recent events |
| `GET` | `/api/agents` | List configured AI Agents |
| `POST` | `/api/agents` | Create new agent with permissions & clearance |
| `PUT` | `/api/agents/{id}` | Update agent system prompt or clearance level |
| `DELETE`| `/api/agents/{id}` | Delete agent configuration |
| `POST` | `/api/agents/{id}/test` | Execute security test suite on targeted agent |
| `GET` | `/api/security-tests` | List security test cases catalog |
| `POST` | `/api/security-tests/run` | Execute security assessment by category |
| `GET` | `/api/results` | List test execution results |
| `GET` | `/api/security-events` | List security incident logs |
| `GET` | `/api/tool-calls` | Audit trail of tool invocations |
| `GET` | `/api/reports/{id}` | Get report JSON payload |
| `POST` | `/api/reports/{id}/generate`| Generate styled printable report |

---

## 🔒 Security & Safety Disclaimers

1. **Controlled Environment:** All security tests execute strictly inside local mock sandbox tools (`mock_search`, `mock_database`, `mock_file`, `call_mock_api`, `calculator`).
2. **No Real Attacks:** The platform **NEVER** performs attacks or network requests against real external servers.
3. **Demo Secrets:** All tokens, SSNs, and passphrases in `demo_data/` are synthetic mock strings created exclusively for security testing demonstrations.

---

## 🎓 Academic / Project Attribution
Designed and built for **B.Tech Computer Science / IoT Cybersecurity Project Demonstration**.  
*Engineered with FastAPI, React, LangGraph, and Tailwind CSS.*
