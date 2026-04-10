# 🧠 Intelligent Employee Productivity & Burnout Analytics System

> A full-stack AI-powered HR analytics platform that monitors employee wellbeing, predicts burnout risk, and delivers real-time engagement insights during live meetings.

---

## 📌 Table of Contents

1. [What It Does](#what-it-does)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [System Architecture & Data Flow](#system-architecture--data-flow)
5. [Page-by-Page Breakdown](#page-by-page-breakdown)
6. [API Reference](#api-reference)
7. [AI Integration](#ai-integration)
8. [Database Models](#database-models)
9. [How to Run Locally](#how-to-run-locally)
10. [Environment Variables](#environment-variables)
11. [Key Features](#key-features)

---

## What It Does

This platform helps HR managers and team leads:

- 📊 **Monitor** employee productivity and workload in real-time
- 🔥 **Predict** burnout risk using AI (Gemma via Ollama) and rule-based scoring
- 💬 **Analyze** emotional sentiment from employee messages and meetings
- 🎥 **Track** live meeting engagement via camera, microphone, and chat
- 🤖 **Query** an AI assistant for natural-language HR insights
- 🚨 **Detect** anomalies (overworking, low sentiment, excessive workload)

---

## Tech Stack

### Frontend
| Technology | Role |
|-----------|------|
| React 18 | UI framework |
| Vite | Dev server & bundler |
| Tailwind CSS | Apple-style design system |
| Framer Motion | Animations & transitions |
| Recharts | Charts (Line, Radar, Bar, Pie) |
| React Router v6 | Client-side routing |
| Axios | HTTP API calls |
| WebRTC (`getUserMedia`) | Live camera & microphone access |
| Web Audio API | Real-time speaking detection |

### Backend
| Technology | Role |
|-----------|------|
| Node.js + Express | REST API server |
| MongoDB Atlas | Cloud database |
| Mongoose | Schema & ORM layer |
| Axios | Calls to Ollama AI |
| dotenv | Environment management |

### AI
| Technology | Role |
|-----------|------|
| Ollama | Local AI model runtime |
| Gemma (Google) | Burnout insights + sentiment classification |
| Rule-based NLP | Fallback when AI model is unavailable |

---

## Project Structure

```
intelligent-burnout-analytics/
│
├── backend/                        # Node.js + Express API
│   ├── config/
│   │   └── db.js                   # MongoDB connection with Atlas failover
│   ├── controllers/
│   │   ├── employeeController.js   # Employee CRUD + burnout scoring
│   │   ├── analyticsController.js  # Productivity & burnout aggregations
│   │   ├── aiController.js         # Gemma AI insights with caching
│   │   ├── sentimentController.js  # Chat sentiment analysis
│   │   └── engagementController.js # Meeting engagement tracking
│   ├── models/
│   │   ├── Employee.js             # Employee schema (burnout, productivity, logs)
│   │   ├── Analytics.js            # Cached analytics snapshots
│   │   ├── SentimentLog.js         # Per-message sentiment history
│   │   └── EngagementLog.js        # Per-meeting engagement scores
│   ├── routes/
│   │   ├── employeeRoutes.js       # /api/employees
│   │   ├── analyticsRoutes.js      # /api/analytics
│   │   ├── aiRoutes.js             # /api/ai
│   │   ├── sentimentRoutes.js      # /api/sentiment
│   │   └── engagementRoutes.js     # /api/engagement
│   ├── services/
│   │   ├── analyticsService.js     # Aggregation & anomaly detection logic
│   │   └── ai/
│   │       ├── aiService.js        # Gemma AI calls + fallback logic
│   │       └── sentimentAnalysisService.js # NLP classification
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── mock_data/
│   │   └── employees.js            # 10 demo employees for seeding
│   ├── seed.js                     # Database seeder
│   ├── killport.js                 # Pre-start port cleanup utility
│   ├── server.js                   # Express app entry point
│   └── .env                        # Environment variables
│
└── frontend/                       # React + Vite app
    └── src/
        ├── components/
        │   ├── layout/
        │   │   ├── MainLayout.jsx  # Shell: sidebar + topbar + content
        │   │   ├── Sidebar.jsx     # Navigation sidebar
        │   │   └── TopNavbar.jsx   # Top bar with search & theme toggle
        │   ├── cards/
        │   │   └── KpiCard.jsx     # Metric card (value + trend)
        │   └── ui/
        │       ├── index.jsx       # Badge, Card, Skeleton, PageHeader
        │       └── FadeIn.jsx      # Scroll-triggered fade animation
        ├── pages/
        │   ├── Dashboard.jsx       # Main analytics overview
        │   ├── EmployeeProfile.jsx # Employee list & drill-down
        │   ├── Reports.jsx         # Alerts & anomaly feed
        │   ├── Insights.jsx        # AI recommendations
        │   ├── AIAssistant.jsx     # Conversational AI interface
        │   └── MeetingRoom.jsx     # Live camera + engagement tracking
        ├── context/
        │   └── ThemeContext.jsx    # Dark/light mode state
        ├── hooks/
        │   └── useMeetingEngagement.js # (Legacy hook, superseded)
        ├── services/
        │   └── api.js              # Centralized Axios API layer
        ├── App.jsx                 # Router setup
        └── main.jsx                # React entry point
```

---

## System Architecture & Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                       │
│                                                               │
│  Dashboard → api.js → GET /api/employees                     │
│                     → GET /api/analytics/productivity        │
│                     → GET /api/analytics/burnout             │
│                                                               │
│  Employee Profile → GET /api/employees/:id                   │
│                   → GET /api/ai/:id  (Gemma insights)        │
│                                                               │
│  Meeting Room  → Camera (WebRTC getUserMedia)                 │
│               → Mic (Web Audio API - speaking detection)     │
│               → Chat → POST /api/sentiment/analyze           │
│               → Score → GET /api/engagement/:meetingId/:user │
│                                                               │
│  AI Assistant → GET /api/analytics/burnout                   │
│              → GET /api/analytics/anomalies                  │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP (Axios)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                      BACKEND (Express)                        │
│                                                               │
│  Express Router                                               │
│    /api/employees      → employeeController.js               │
│    /api/analytics      → analyticsController.js              │
│    /api/ai             → aiController.js                     │
│    /api/sentiment      → sentimentController.js              │
│    /api/engagement     → engagementController.js             │
│                                                               │
│  Services Layer                                               │
│    analyticsService.js  → Aggregates MongoDB data            │
│    aiService.js         → Calls Ollama or uses fallback      │
│    sentimentService.js  → NLP classification                 │
└──────────┬────────────────────────────┬──────────────────────┘
           │ Mongoose queries            │ Axios POST
           ▼                            ▼
┌─────────────────────┐     ┌────────────────────────┐
│   MongoDB Atlas     │     │  Ollama (localhost)     │
│                     │     │                         │
│  - Employee         │     │  Model: gemma:2b        │
│  - EngagementLog    │     │  Port: 11434            │
│  - SentimentLog     │     │  /api/generate          │
│  - Analytics        │     │                         │
└─────────────────────┘     └────────────────────────┘
```

---

## Page-by-Page Breakdown

### 1. 📊 Dashboard (`/`)
**What it does:** The main overview page. Shows org-wide health at a glance.

**How it works:**
- Fetches all employees → calculates KPI metrics (total, avg productivity, burnout counts)
- Fetches `/api/analytics/productivity` → renders department bar chart + weekly trend line chart
- Fetches `/api/analytics/burnout` → renders risk distribution pie/donut chart
- Fetches `/api/analytics/anomalies` → displays flagged employees in alert cards
- Uses skeleton loaders while data fetches (Apple-style shimmer effect)

---

### 2. 👥 Employee Management (`/employees`)
**What it does:** Browse all employees, search, filter by department/risk, drill into individual profiles.

**How it works:**
- Fetches `GET /api/employees` on mount
- Search filters the local array (no re-fetch needed)
- Clicking an employee opens a modal (`EmployeeModal`)
- Modal fetches `GET /api/ai/:id` to show Gemma's burnout risk assessment
- Risk badge colors: 🔴 High / 🟡 Medium / 🟢 Low

---

### 3. 🚨 Reports / Alerts (`/alerts`)
**What it does:** Lists all anomalies detected in the workforce.

**How it works:**
- Fetches `GET /api/analytics/anomalies`
- Backend scans all active employees' last 7 activity logs
- Flags: excessive hours (>10/day), low sentiment (<40), overloaded (>120%), declining efficiency
- Each anomaly card animates in with Framer Motion stagger

---

### 4. 💡 Insights (`/insights`)
**What it does:** AI-generated recommendations for the team.

**How it works:**
- Fetches burnout data + anomalies from backend
- Displays actionable recommendation cards based on detected patterns
- Recommendations are dynamically generated, not hardcoded

---

### 5. 🤖 AI Assistant (`/ai-assistant`)
**What it does:** Chat interface — ask questions in natural language about your team.

**How it works:**
- User types questions like "Who is at highest burnout risk?"
- Frontend matches question keywords to backend endpoints:
  - Burnout queries → `GET /api/analytics/burnout`
  - Anomaly queries → `GET /api/analytics/anomalies`
  - General queries → `GET /api/employees`
- Formats real employee data into a natural-language response
- No hallucination — all answers are backed by live MongoDB data

---

### 6. 🎥 Meeting Room (`/meeting`)
**What it does:** Real-time engagement tracking during live meetings.

**How it works:**

```
User clicks "Start Camera"
       ↓
navigator.mediaDevices.getUserMedia()
       ↓
Stream stored in ref → attached to <video> element (always in DOM)
       ↓
Web Audio API analyzes microphone for speaking bursts (≥2s chunks)
       ↓
Every 5 seconds:
  → POST /api/engagement/track-speaking (accumulated seconds)
  → GET  /api/engagement/:meetingId/:userId
  → Backend computes: (40% emotion) + (35% speaking) + (25% chat)
  → Score plotted on live LineChart + RadarChart
       ↓
Chat messages → POST /api/sentiment/analyze → Gemma classifies sentiment
             → Tag shown next to each message (Positive/Neutral/Frustrated/Exhausted)
```

---

## API Reference

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/:id` | Get single employee |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| POST | `/api/employees/:id/activity` | Add activity log entry |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/productivity` | Org-wide productivity metrics + trends |
| GET | `/api/analytics/burnout` | Burnout distribution + high-risk list |
| GET | `/api/analytics/anomalies` | Threshold-based anomaly detection |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/status` | Check if Ollama + model are running |
| GET | `/api/ai/:id` | Get Gemma insights for an employee (1hr cache) |
| POST | `/api/ai/batch` | Batch-process all high-risk employees |

### Sentiment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sentiment/analyze` | Classify a message's emotional tone |
| POST | `/api/sentiment/bulk` | Bulk analyze multiple messages |
| GET | `/api/sentiment/:employeeId` | Get sentiment history |
| GET | `/api/sentiment/trends/:employeeId` | Get emotional drift trends |

### Engagement
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/engagement/:meetingId/:userId` | Get current engagement score |
| POST | `/api/engagement/track-speaking` | Log speaking activity |
| POST | `/api/engagement/track-chat` | Log chat message event |
| POST | `/api/engagement/analyze-emotion` | Log emotion detection result |

---

## AI Integration

### How Gemma Works in This System

```
1. Request arrives at GET /api/ai/:employeeId
2. aiController checks if cached insight < 1 hour old → return cache
3. If stale → calls aiService.generateInsights(employee)
4. aiService.resolveModelName() → checks Ollama for installed models
5. If model found:
     → Builds structured prompt with employee data (hours, tasks, sentiment)
     → POST http://localhost:11434/api/generate
     → Parses JSON from response (strips markdown if present)
     → Returns { riskLevel, keyInsights, recommendations }
6. If model NOT found:
     → Falls back to rule-based logic:
         avgHours > 10 OR sentiment < 40 OR workload > 120 → High Risk
         avgHours > 9  OR sentiment < 55 OR workload > 100 → Medium Risk
         else → Low Risk
     → Generates appropriate insight text
7. Result saved to employee.lastAIInsight in MongoDB
```

### Sentiment Analysis Flow

```
POST /api/sentiment/analyze { message: "I'm exhausted" }
       ↓
sentimentAnalysisService.analyzeMessage()
       ↓
Preprocesses text (lowercase, strip whitespace)
       ↓
Calls Ollama → "Classify as: Positive | Neutral | Frustrated | Exhausted"
       ↓
If Ollama unavailable → ruleBasedFallback() checks keywords:
  "tired", "burnt", "overwhelmed" → Exhausted
  "annoyed", "blocked", "ridiculous" → Frustrated
  "great", "awesome", "love" → Positive
  else → Neutral
       ↓
Returns { sentiment, score, explanation }
Saved to SentimentLog collection
```

---

## Database Models

### Employee
```
{
  name, email, department, role,
  productivityScore (0-100),
  workload (% of capacity),
  burnoutRisk ("Low" | "Medium" | "High"),
  sentimentScore (0-100),
  status ("Active" | "On Leave"),
  activityLogs: [{ date, hoursWorked, tasksCompleted, sentimentScore }],
  lastAIInsight: { riskLevel, keyInsights, recommendations, generatedAt }
}
```

### EngagementLog
```
{
  userId (String),
  meetingId (String),
  overallScore,
  emotionScore,
  speakingDuration (seconds),
  speakingScore,
  chatCount,
  chatScore,
  timestamp
}
```

### SentimentLog
```
{
  employeeId,
  message,
  source ("Chat" | "Survey" | "Email"),
  sentiment ("Positive" | "Neutral" | "Frustrated" | "Exhausted"),
  score (-2 to +2),
  explanation,
  timestamp
}
```

---

## How to Run Locally

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Ollama installed → https://ollama.com/download

### 1. Clone & Install

```bash
git clone https://github.com/aditisingh013/Hackathon.git
cd intelligent-burnout-analytics

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/burnout
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma:2b
CORS_ORIGIN=http://localhost:5173
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

### 4. Install AI Model (Optional)

```bash
ollama pull gemma:2b
```
> The system works without this — it uses rule-based fallback automatically.

### 5. Start the Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Starts on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Starts on http://localhost:5173
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Express server port |
| `MONGODB_URI` | — | MongoDB connection string |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `gemma:2b` | AI model to use |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |

---

## Key Features

| Feature | How It's Built |
|---------|---------------|
| 🔥 Burnout Risk Prediction | AI (Gemma) + rule-based scoring on hours/workload/sentiment |
| 📊 Live Charts | Recharts LineChart, RadarChart, BarChart, PieChart |
| 🎥 Camera Tracking | WebRTC `getUserMedia` → always-mounted `<video>` ref pattern |
| 🎤 Speaking Detection | Web Audio API + 2-second minimum burst filter (anti-fake) |
| 💬 Sentiment Tagging | Per-message NLP classification in the meeting chat |
| 🌗 Dark Mode | System-aware, persisted to `localStorage` |
| ⚡ Smart Port Management | `killport.js` auto-clears port conflicts on every dev start |
| 🔄 AI Fallback | Graceful rule-based degradation when Ollama is unavailable |
| ☁️ Cloud DB | MongoDB Atlas with automatic local MongoDB failover |
| 🚀 1-Hour AI Cache | AI insights cached on employee document to avoid repeated calls |

---

*Built for Hackathon 2026 — Intelligent HR Analytics powered by Gemma AI*
