"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

type DecisionNodeData = {
  label: string;
  prompt: string;
};

type DecisionNodeType = Node<DecisionNodeData, "decision">;

function DecisionNode({ data, selected }: NodeProps<DecisionNodeType>) {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-md ${
        selected ? "border-blue-500" : "border-gray-200"
      }`}
    >
      <div className="font-bold text-sm mb-1">{data.label}</div>
      <div className="text-xs text-gray-500 truncate max-w-[150px]">
        {data.prompt}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400"
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="YES"
        className="w-3 h-3 !bg-green-500"
        style={{ left: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="NO"
        className="w-3 h-3 !bg-red-500"
        style={{ left: "70%" }}
      />
    </div>
  );
}

export default memo(DecisionNode);
