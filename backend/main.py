import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import inngest
import inngest.fast_api
from inngest_app.client import inngest_client
from inngest_app.functions import run_workflow
from models import WorkflowRunInput, RunStatus
from store import RUNS

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/runs")
async def start_run(payload: WorkflowRunInput):
    run_id = str(uuid.uuid4())
    RUNS[run_id] = RunStatus(run_id=run_id, status="running", log=[])
    await inngest_client.send(
        inngest.Event(
            name="workflow/run",
            data={"run_id": run_id, **payload.model_dump()},
        )
    )
    return {"run_id": run_id}


@app.get("/runs/{run_id}")
async def get_run(run_id: str) -> RunStatus:
    return RUNS.get(run_id, RunStatus(run_id=run_id, status="failed", log=[]))


inngest.fast_api.serve(app, inngest_client, [run_workflow])
