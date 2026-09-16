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
  totalAttempts: number;

  setNodes: (nodes: DecisionFlowNode[]) => void;
  setEdges: (edges: DecisionFlowEdge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: () => void;
  setSelectedNodeId: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<DecisionNodeData>) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  setRunId: (id: string | null) => void;
  setRunStatus: (status: "idle" | "running" | "completed" | "failed") => void;
  setExecutionLog: (log: ExecutionStep[]) => void;
  setTotalAttempts: (total: number) => void;
};

type ExecutionStep = {
  nodeId: string;
  label: string;
  prompt: string;
  result: "YES" | "NO";
  timestamp: string;
  attempt: number;
  failed: boolean;
};

const STORAGE_KEY = "ai-decision-flow-graph";

function loadFromStorage(): { nodes: DecisionFlowNode[]; edges: DecisionFlowEdge[] } {
  if (typeof window === "undefined") return { nodes: [], edges: [] };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return { nodes: data.nodes || [], edges: data.edges || [] };
    }
  } catch {}
  return { nodes: [], edges: [] };
}

function saveToStorage(nodes: DecisionFlowNode[], edges: DecisionFlowEdge[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
  } catch {}
}

const initialData = loadFromStorage();

function getNextNodeNumber(nodes: DecisionFlowNode[]): number {
  const usedNumbers = new Set(
    nodes.map((n) => {
      const match = n.id.match(/node-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
  );
  let i = 1;
  while (usedNumbers.has(i)) i++;
  return i;
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  nodes: initialData.nodes,
  edges: initialData.edges,
  selectedNodeId: null,
  runId: null,
  runStatus: "idle",
  executionLog: [],
  totalAttempts: 0,

  setNodes: (nodes) => {
    saveToStorage(nodes, get().edges);
    set({ nodes });
  },

  setEdges: (edges) => {
    saveToStorage(get().nodes, edges);
    set({ edges });
  },

  onNodesChange: (changes) => {
    const newNodes = applyNodeChanges(changes, get().nodes) as DecisionFlowNode[];
    saveToStorage(newNodes, get().edges);
    set({ nodes: newNodes });
  },

  onEdgesChange: (changes) => {
    const newEdges = applyEdgeChanges(changes, get().edges) as DecisionFlowEdge[];
    saveToStorage(get().nodes, newEdges);
    set({ edges: newEdges });
  },

  onConnect: (connection) => {
    const { nodes, edges } = get();
    const sourceId = connection.source;
    const branch = (connection.sourceHandle as "YES" | "NO") || "YES";

    const existingEdgeForSource = edges.find(
      (e) => e.source === sourceId && e.data?.branch === branch
    );

    let newEdges: DecisionFlowEdge[];
    if (existingEdgeForSource) {
      newEdges = edges.map((e) =>
        e.id === existingEdgeForSource.id
          ? { ...e, target: connection.target!, targetHandle: connection.targetHandle }
          : e
      ) as DecisionFlowEdge[];
    } else {
      const newEdge: DecisionFlowEdge = {
        id: `${sourceId}-${connection.target}-${branch}`,
        source: sourceId!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        data: { branch },
      };
      newEdges = [...edges, newEdge];
    }

    saveToStorage(nodes, newEdges);
    set({ edges: newEdges });
  },

  addNode: () => {
    const num = getNextNodeNumber(get().nodes);
    const newNode: DecisionFlowNode = {
      id: `node-${num}`,
      type: "decision",
      position: { x: 250, y: num * 150 },
      data: { label: `Node ${num}`, prompt: "" },
    };
    const newNodes = [...get().nodes, newNode];
    saveToStorage(newNodes, get().edges);
    set({ nodes: newNodes });
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) => {
    const newNodes = get().nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, ...data } } : n
    );
    saveToStorage(newNodes, get().edges);
    set({ nodes: newNodes });
  },

  deleteNode: (id) => {
    const newNodes = get().nodes.filter((n) => n.id !== id);
    const newEdges = get().edges.filter((e) => e.source !== id && e.target !== id);
    saveToStorage(newNodes, newEdges);
    set({ nodes: newNodes, edges: newEdges, selectedNodeId: null });
  },

  deleteEdge: (id) => {
    const newEdges = get().edges.filter((e) => e.id !== id);
    saveToStorage(get().nodes, newEdges);
    set({ edges: newEdges });
  },

  setRunId: (id) => set({ runId: id }),
  setRunStatus: (status) => set({ runStatus: status }),
  setExecutionLog: (log) => set({ executionLog: log }),
  setTotalAttempts: (total) => set({ totalAttempts: total }),
}));
