# Intelligent Employee Productivity & Burnout Analytics System

## Project Overview
This project is an AI-powered full-stack application designed to track employee productivity and predict burnout using the Google Gemma LLM model. It leverages a modern frontend, scalable backend, and a robust AI micro-service pattern.

## Directory Structure
Below is an overview of the structural layout of this repository:

```text
intelligent-burnout-analytics/
├── backend/                              # Node.js + Express backend application
│   ├── config/                           # Environment setup and external connections (DB, AI APIs)
│   ├── controllers/                      # Request handlers grouped by business logic domain
│   ├── middleware/                       # Request processing (auth checking, error handling, validation)
│   ├── mock_data/                        # Dummy employee demographic and metric data for hackathons
│   ├── models/                           # MongoDB schemas and models via Mongoose
│   ├── routes/                           # API route definitions and endpoint maps
│   ├── services/                         # Shared business logic and external integrations
│   │   └── ai/                           # Dedicated directory for AI operations and LLM coordination
│   │       ├── gemmaClient.js            # Base client handling Gemini/Gemma local/remote inference calls
│   │       ├── sentiment.service.js      # Processes textual input for sentiment classification
│   │       ├── chatbot.service.js        # Core logic for "Burnout Buddy" conversational assistant
│   │       └── burnoutScore.service.js   # AI-powered heuristic calculation of the burnout index
│   └── utils/                            # Generic helper functions, formatters, and constants
├── frontend/                             # React frontend application
│   ├── public/                           # Static assets like favicon and index.html
│   └── src/                              # Main frontend source code
│       ├── assets/                       # Global images, icons, and general media
│       ├── components/                   # Reusable atomic UI components
│       │   ├── alerts/                   # Notification banners and alert modals
│       │   ├── cards/                    # KPI cards and profile summary elements
│       │   ├── charts/                   # Chart.js or Recharts graph wrappers
│       │   └── layout/                   # Navbar, Sidebar, and core structural wrappers
│       ├── context/                      # React context for global state (Theme, Auth, Data)
│       ├── hooks/                        # Custom React hooks for shared side-effects (useAuth, useAPI)
│       ├── pages/                        # Individual routed page views
│       │   ├── AIAssistant/              # Chatbot interface page communicating with Gemma
│       │   ├── Dashboard/                # Main analytics dashboard showing org health
│       │   ├── EmployeeProfile/          # Individual employee statistics and recommendations
│       │   └── Reports/                  # Detailed metrics lists and data exports
│       ├── services/                     # Functions managing fetch/axios API calls to the backend
│       ├── styles/                       # CSS, SASS, or Tailwind configurations and global styles
│       └── utils/                        # Frontend UI helper functions and formatters
└── .env.example                          # Expected environment variables configuration template
```

## Tech Stack
* **Frontend**: React (Functional Components, Hooks), Vite/CRA
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose)
* **AI Integration**: Google Gemma 4 (Local Inference via Ollama / API)

## Getting Started
1. Clone the repository
2. Navigate to `/backend` and run `npm install`. Duplicate `.env.example` to `.env` and fill variables. Run `npm run dev`.
3. Navigate to `/frontend` and run `npm install`. Run `npm run dev`.
4. Run your local Ollama or Gemma instance on the specified API port.
