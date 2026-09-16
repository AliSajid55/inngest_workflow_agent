import { Node, Edge } from "@xyflow/react";

export type DecisionNodeData = { label: string; prompt: string };
export type DecisionFlowNode = Node<DecisionNodeData, "decision">;

export type DecisionEdgeData = { branch: "YES" | "NO" };
export type DecisionFlowEdge = Edge<DecisionEdgeData>;

export type WorkflowRunInput = {
  nodes: DecisionFlowNode[];
  edges: DecisionFlowEdge[];
  startNodeId: string;
  inputText: string;
};

export type ExecutionStep = {
  nodeId: string;
  label: string;
  prompt: string;
  result: "YES" | "NO";
  timestamp: string;
  attempt: number;
  failed: boolean;
};

export type RunStatus = {
  runId: string;
  status: "running" | "completed" | "failed";
  log: ExecutionStep[];
  totalAttempts: number;
};
