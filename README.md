# AI Decision Flow Agent

An autonomous AI-powered decision engine that visually orchestrates intelligent workflows through a node-based graph interface. Each node acts as an AI agent that evaluates context, makes binary decisions, and routes execution dynamically - turning static flowcharts into living, reasoning systems.

## What It Does

This isn't a diagram tool. It's a **thinking machine**.

You build a graph of decision nodes. Each node contains a prompt - a question for the AI. When you hit **Run**, the system:

1. Traverses the graph starting from the first node
2. Sends each node's prompt + context to an LLM (via OpenRouter)
3. Receives a **YES** or **NO** decision
4. Follows the corresponding edge to the next node
5. Reaches a terminal node and returns the full execution trace

The AI doesn't just follow paths — it **chooses** them.

## Architecture

```
┌─────────────────┐     POST /runs      ┌─────────────────┐
│   React Flow     │ ──────────────────► │   FastAPI        │
│   Frontend       │ ◄────────────────── │   Backend        │
│   (Next.js 16)   │    GET /runs/:id    │   (Python 3.12)  │
└─────────────────┘                      └────────┬────────┘
                                                  │
                                         Inngest Event
                                                  │
                                         ┌────────▼────────┐
                                         │   Inngest        │
                                         │   Workflow       │
                                         │   Engine         │
                                         └────────┬────────┘
                                                  │
                                         Step-by-step
                                         Execution
                                                  │
                                         ┌────────▼────────┐
                                         │   OpenRouter     │
                                         │   LLM API        │
                                         └─────────────────┘
```

**Frontend** - Thin client. Renders the graph, captures user input, polls for results. No business logic.

**Backend** - FastAPI server. Accepts workflow definitions, fans out Inngest events, tracks run state.

**Inngest** - Durable execution engine. Runs each node as a retriable step with automatic timeout handling.

**OpenRouter** - LLM gateway. Routes prompts to the best available model. Swap models without changing code.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Visual Editor | @xyflow/react (React Flow) |
| State Management | Zustand with localStorage persistence |
| UI Components | Custom shadcn/ui (vanilla, no @base-ui) |
| Backend | Python 3.12, FastAPI, Pydantic v2 |
| Workflow Engine | Inngest Python SDK v0.5 |
| LLM Provider | OpenRouter (any model) |
| Package Manager | pnpm (frontend), pip (backend) |

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.12+
- OpenRouter API key ([get one here](https://openrouter.ai/keys))

### 1. Clone & Install

```bash
# Frontend
cd frontend
pnpm install

# Backend
cd ../backend
python -m venv venv
.\venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# backend/.env
OPENAI_API_KEY=your-openrouter-api-key
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=your-chosen-model
INNGEST_DEV=1
```

```bash
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3. Run Everything

```bash
# Terminal 1 — Frontend
cd frontend
pnpm dev

# Terminal 2 — Backend
cd backend
python main.py

# Terminal 3 — Inngest Dev Server
cd backend
npx inngest-cli@latest dev
```

Open `http://localhost:3000`. Build your graph. Hit Run. Watch it think.

## Features

### Visual Workflow Builder

Drag-and-drop node creation with custom React Flow components. Each node is an editable card with a label and prompt. Connect nodes with YES/NO edges - each source node supports exactly one of each.

### AI-Powered Decision Making

Every node is an LLM call. The AI receives the node's prompt combined with the workflow's input text, then returns a binary YES/NO decision. The system follows the matching edge to the next node.

### Execution Timeline

Real-time execution log with animated step visualization. See which nodes fired, what the AI decided, and how the execution path flowed through your graph.

### Animated Execution State

Edges pulse with dashed animations as execution flows through them. Nodes highlight in blue (running), green (completed), or grey (processed) - giving you a live view of the AI's reasoning path.

### Retry & Error Handling

Failed LLM calls are automatically retried up to 3 times via Inngest's built-in retry mechanism. The execution log tracks attempt counts and surfaces retry information with orange badges.

### Save / Load Workflows

Save unlimited workflow snapshots to localStorage with custom names. Load any saved workflow instantly. Delete old saves you no longer need.

### JSON Export / Import

Export your complete workflow (nodes + edges) as a `.json` file. Import it on any machine. Share workflows with your team without requiring a database.

### Node Reuse Numbering

Delete a node and create a new one - the system reuses the first available number instead of incrementing forever. Stay organized.

### Keyboard Shortcuts

Select any node or edge and press **Delete** / **Backspace** to remove it. Nodes are removed along with all connected edges.

## Project Structure

```
inngest_workflow_agent/
├── frontend/                    # Next.js 16 application
│   ├── app/
│   │   ├── layout.tsx           # Root layout with hydration handling
│   │   └── page.tsx             # Main page with ReactFlowProvider
│   ├── components/
│   │   ├── flow/
│   │   │   ├── FlowEditor.tsx   # React Flow canvas + animated edges
│   │   │   ├── DecisionNode.tsx # Editable node with label + prompt
│   │   │   └── nodeTypes.ts     # Node type registry
│   │   ├── panels/
│   │   │   ├── Toolbar.tsx      # Controls: Add, Run, Save, Load, Export
│   │   │   └── ExecutionLogPanel.tsx  # Timeline execution viewer
│   │   └── ui/                  # Custom shadcn components
│   ├── lib/
│   │   ├── api.ts               # Backend API client (snake↔camel)
│   │   ├── store.ts             # Zustand state + localStorage
│   │   ├── types.ts             # Shared TypeScript types
│   │   └── utils.ts             # cn() utility
│   └── .env.local               # Frontend environment
│
├── backend/                     # FastAPI + Inngest server
│   ├── main.py                  # FastAPI app, CORS, Inngest serve
│   ├── llm.py                   # OpenRouter LLM wrapper
│   ├── models.py                # Pydantic schemas
│   ├── store.py                 # In-memory run tracking
│   ├── requirements.txt         # Python dependencies
│   ├── inngest_app/
│   │   ├── client.py            # Inngest client init
│   │   └── functions.py         # Workflow execution logic
│   ├── pyrightconfig.json       # IDE venv detection
│   └── .env                     # Backend environment
│
└── AI-Decision-Flow-Build-Spec-Python-Backend.md  # Build specification
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/runs` | Start a new workflow execution |
| `GET` | `/runs/:id` | Get run status and execution log |
| `POST` | `/api/inngest` | Inngest webhook (auto-handled) |

### POST /runs

```json
{
  "nodes": [{ "id": "node-1", "type": "decision", "data": { "label": "Check", "prompt": "Is it raining?" } }],
  "edges": [{ "id": "edge-1", "source": "node-1", "target": "node-2", "data": { "branch": "YES" } }],
  "start_node_id": "node-1",
  "input_text": "The sky is grey and clouds are forming"
}
```

### GET /runs/:id

```json
{
  "run_id": "abc-123",
  "status": "completed",
  "log": [
    {
      "node_id": "node-1",
      "label": "Check",
      "prompt": "Is it raining?",
      "result": "YES",
      "timestamp": "2026-09-15T10:30:00",
      "attempt": 1,
      "failed": false
    }
  ],
  "total_attempts": 1
}
```

## How Decisions Work

Each decision node contains a **prompt** — a question for the AI. When executed:

1. The prompt is combined with the workflow's `input_text`
2. The LLM evaluates the combined context
3. The response is normalized: any answer starting with "YES" → `YES`, otherwise → `NO`
4. The system follows the matching edge to the next node
5. If no matching edge exists, execution terminates

This means your prompts should be **yes/no questions**. Examples:

- "Does the user's message contain a complaint?"
- "Is the input a valid email address?"
- "Should this be escalated to a human?"

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenRouter API key |
| `LLM_BASE_URL` | Yes | `https://openrouter.ai/api/v1` |
| `LLM_MODEL` | Yes | Model ID (e.g., `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`) |
| `INNGEST_DEV` | Optional | Set to `1` for dev mode |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend URL (default: `http://localhost:8000`) |

## License

Private - build specification for personal use only. Not licensed for redistribution.

## Author

AI Engineer | Deep Learning | Computer Vision | GEN AI | Agentic AI