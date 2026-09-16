"use client";

import { useMemo, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type EdgeProps,
  BaseEdge,
  getBezierPath,
  type Node,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./nodeTypes";
import { useFlowStore } from "../../lib/store";

function YesNoEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = data as { branch?: string; animated?: boolean } | undefined;
  const isYes = edgeData?.branch === "YES";
  const isAnimated = edgeData?.animated;
  const color = isYes ? "#22c55e" : "#ef4444";
  const branchLabel = edgeData?.branch || "";

  return (
    <BaseEdge
      path={edgePath}
      style={{
        ...style,
        stroke: color,
        strokeWidth: isAnimated ? 3 : 2,
        strokeDasharray: isAnimated ? "8 4" : undefined,
      }}
      label={branchLabel}
      labelStyle={{ fill: color, fontWeight: "bold", fontSize: 12 }}
      labelBgStyle={{ fill: "white", fillOpacity: 0.8 }}
      markerEnd={markerEnd}
    />
  );
}

const edgeTypes = {
  default: YesNoEdge,
};

function ActiveNodeWrapper({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) {
  return <div {...props}>{children}</div>;
}

export default function FlowEditor() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const executionLog = useFlowStore((s) => s.executionLog);
  const runStatus = useFlowStore((s) => s.runStatus);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const deleteNode = useFlowStore((s) => s.deleteNode);
  const deleteEdge = useFlowStore((s) => s.deleteEdge);
  const { getNodes, getEdges } = useReactFlow();

  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        const selectedNodes = getNodes().filter((n) => n.selected);
        const selectedEdges = getEdges().filter((e) => e.selected);

        if (selectedNodes.length > 0) {
          selectedNodes.forEach((n) => deleteNode(n.id));
        } else if (selectedEdges.length > 0) {
          selectedEdges.forEach((e) => deleteEdge(e.id));
        }
      }
    },
    [getNodes, getEdges, deleteNode, deleteEdge]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const { processedNodes, animatedEdges } = useMemo(() => {
    if (executionLog.length === 0) {
      return { processedNodes: new Set<string>(), animatedEdges: new Set<string>() };
    }

    const processed = new Set<string>();
    const animated = new Set<string>();

    executionLog.forEach((step, i) => {
      processed.add(step.nodeId);

      if (i > 0) {
        const prevStep = executionLog[i - 1];
        const edgeId = `${prevStep.nodeId}-${step.nodeId}`;
        animated.add(edgeId);
      }
    });

    return { processedNodes: processed, animatedEdges: animated };
  }, [executionLog]);

  const nodesWithState = useMemo(() => {
    if (executionLog.length === 0) return nodes;

    const lastStep = executionLog[executionLog.length - 1];
    const isRunning = runStatus === "running";

    return nodes.map((node) => {
      const wasProcessed = processedNodes.has(node.id);
      const isLastActive = lastStep?.nodeId === node.id;

      return {
        ...node,
        style: {
          ...node.style,
          borderColor: isLastActive
            ? isRunning
              ? "#3b82f6"
              : "#22c55e"
            : wasProcessed
            ? "#94a3b8"
            : undefined,
          borderWidth: isLastActive ? 3 : wasProcessed ? 2 : undefined,
        },
      };
    });
  }, [nodes, executionLog, processedNodes, runStatus]);

  const edgesWithAnimation = useMemo(() => {
    return edges.map((edge) => {
      const shouldAnimate = animatedEdges.has(edge.id);
      return {
        ...edge,
        data: {
          ...edge.data,
          animated: shouldAnimate,
        },
      };
    });
  }, [edges, animatedEdges]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodesWithState}
        edges={edgesWithAnimation}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={memoizedEdgeTypes}
        fitView
        defaultEdgeOptions={{
          type: "default",
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
