import datetime
import inngest
from typing import Any, Literal, cast
from inngest_app.client import inngest_client
from llm import call_llm
from models import ExecutionStep
from store import RUNS
from models import RunStatus

# Trigger return the results.
@inngest_client.create_function(
    fn_id="run-workflow",
    trigger=inngest.TriggerEvent(event="workflow/run"),
    retries=3,
)

#Data Parsing
async def run_workflow(ctx: inngest.Context) -> dict[str, Any]:
    data: dict[str, Any] = cast(dict[str, Any], ctx.event.data)

    nodes_list: list[dict[str, Any]] = cast(list[dict[str, Any]], data.get("nodes", []))
    nodes: dict[str, dict[str, Any]] = {n["id"]: n for n in nodes_list}

    edges: list[dict[str, Any]] = cast(list[dict[str, Any]], data.get("edges", []))
    input_text: str = str(data.get("input_text", ""))
    run_id: str = str(data.get("run_id", ""))
    current_id: str | None = str(data.get("start_node_id", ""))

    log: list[ExecutionStep] = []

#Loop (while current_id)
    while current_id:
        node = nodes.get(current_id)
        if node is None:
            break

        async def run_node(n: dict[str, Any] = node) -> str:
            result = await call_llm(str(n["data"]["prompt"]), input_text)
            return result

        raw_result: str = await ctx.step.run(f"node-{node['id']}", run_node)
        result: Literal["YES", "NO"] = "YES" if raw_result.strip().upper().startswith("YES") else "NO"

        log.append(ExecutionStep(
            node_id=str(node["id"]),
            label=str(node["data"]["label"]),
            prompt=str(node["data"]["prompt"]),
            result=result,
            timestamp=datetime.datetime.utcnow().isoformat(),
        ))

        next_edge: dict[str, Any] | None = None
        for e in edges:
            if e["source"] == current_id and e.get("data", {}).get("branch") == result:
                next_edge = e
                break

        current_id = str(next_edge["target"]) if next_edge else None

    RUNS[run_id] = RunStatus(
        run_id=run_id,
        status="completed",
        log=log
    )

    return {"log": [s.model_dump() for s in log]}
