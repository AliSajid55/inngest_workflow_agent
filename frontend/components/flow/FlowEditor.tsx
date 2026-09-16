"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type EdgeProps,
  BaseEdge,
  getBezierPath,
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
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = data as { branch?: string } | undefined;
  const isYes = edgeData?.branch === "YES";
  const color = isYes ? "#22c55e" : "#ef4444";
  const branchLabel = edgeData?.branch || "";

  return (
    <BaseEdge
      path={edgePath}
      style={{ stroke: color, strokeWidth: 2 }}
      label={branchLabel}
      labelStyle={{ fill: color, fontWeight: "bold", fontSize: 12 }}
      labelBgStyle={{ fill: "white", fillOpacity: 0.8 }}
    />
  );
}

const edgeTypes = {
  default: YesNoEdge,
};

export default function FlowEditor() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);

  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
