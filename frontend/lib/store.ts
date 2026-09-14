import { create } from "zustand";
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";

export type DecisionNodeData = {
  label: string;
  prompt: string;
  [key: string]: unknown;
};

export type DecisionFlowNode = Node<DecisionNodeData, "decision">;
export type DecisionFlowEdge = Edge<{ branch: "YES" | "NO" }>;

type FlowStore = {
  nodes: DecisionFlowNode[];
  edges: DecisionFlowEdge[];
  selectedNodeId: string | null;
  runId: string | null;
  runStatus: "idle" | "running" | "completed" | "failed";
  executionLog: ExecutionStep[];

  setNodes: (nodes: DecisionFlowNode[]) => void;
  setEdges: (edges: DecisionFlowEdge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (node: DecisionFlowNode) => void;
  setSelectedNodeId: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<DecisionNodeData>) => void;
  setRunId: (id: string | null) => void;
  setRunStatus: (status: "idle" | "running" | "completed" | "failed") => void;
  setExecutionLog: (log: ExecutionStep[]) => void;
};

type ExecutionStep = {
  nodeId: string;
  label: string;
  prompt: string;
  result: "YES" | "NO";
  timestamp: string;
};

export const useFlowStore = create<FlowStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  runId: null,
  runStatus: "idle",
  executionLog: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as DecisionFlowNode[] });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) as DecisionFlowEdge[] });
  },

  onConnect: (connection) => {
    const branch = (connection.sourceHandle as "YES" | "NO") || "YES";
    const newEdge = {
      ...connection,
      data: { branch },
    } as DecisionFlowEdge;
    set({ edges: addEdge(newEdge, get().edges) as DecisionFlowEdge[] });
  },

  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),

  setRunId: (id) => set({ runId: id }),
  setRunStatus: (status) => set({ runStatus: status }),
  setExecutionLog: (log) => set({ executionLog: log }),
}));
