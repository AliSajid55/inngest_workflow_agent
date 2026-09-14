# Backend - AI Decision Flow

FastAPI backend with Inngest workflow engine.

## Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\Activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with:
# OPENAI_API_KEY=sk-...
# INNGEST_DEV=1
```

## Running

Start all three services in separate terminals:

```bash
# Terminal 1: Backend (port 8000)
uvicorn main:app --reload --port 8000

# Terminal 2: Inngest Dev Server
npx inngest-cli@latest dev

# Terminal 3: Frontend (port 3000)
cd ../frontend && npm run dev
```

## API Endpoints

- `POST /runs` - Start a new workflow run
- `GET /runs/{run_id}` - Get run status and execution log
