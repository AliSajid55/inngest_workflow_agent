from pydantic import BaseModel
from typing import Literal


class DecisionNodeData(BaseModel):
    label: str
    prompt: str


class DecisionNode(BaseModel):
    id: str
    type: Literal["decision"] = "decision"
    data: DecisionNodeData


class DecisionEdgeData(BaseModel):
    branch: Literal["YES", "NO"]


class DecisionEdge(BaseModel):
    id: str
    source: str
    target: str
    data: DecisionEdgeData


class WorkflowRunInput(BaseModel):
    nodes: list[DecisionNode]
    edges: list[DecisionEdge]
    start_node_id: str
    input_text: str


class ExecutionStep(BaseModel):
    node_id: str
    label: str
    prompt: str
    result: Literal["YES", "NO"]
    timestamp: str
    attempt: int = 1
    failed: bool = False


class RunStatus(BaseModel):
    run_id: str
    status: Literal["running", "completed", "failed"]
    log: list[ExecutionStep] = []
    total_attempts: int = 0
