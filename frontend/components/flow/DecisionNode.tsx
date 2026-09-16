"use client";

import { memo, useCallback } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { useFlowStore } from "../../lib/store";

type DecisionNodeData = {
  label: string;
  prompt: string;
  [key: string]: unknown;
};

type DecisionNodeType = Node<DecisionNodeData, "decision">;

function DecisionNode({ id, data, selected }: NodeProps<DecisionNodeType>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useFlowStore((s) => s.setSelectedNodeId);

  const isSelected = selectedNodeId === id;

  const onLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { label: e.target.value });
    },
    [id, updateNodeData]
  );

  const onPromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { prompt: e.target.value });
    },
    [id, updateNodeData]
  );

  const onClick = useCallback(() => {
    setSelectedNodeId(isSelected ? null : id);
  }, [id, isSelected, setSelectedNodeId]);

  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[180px] cursor-pointer ${
        selected ? "border-blue-500" : "border-gray-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400"
      />

      <input
        type="text"
        value={data.label}
        onChange={onLabelChange}
        onClick={(e) => e.stopPropagation()}
        className="w-full font-bold text-sm border-none outline-none bg-transparent mb-1 text-black"
        placeholder="Label"
      />

      {isSelected && (
        <textarea
          value={data.prompt}
          onChange={onPromptChange}
          onClick={(e) => e.stopPropagation()}
          className="w-full text-xs border border-gray-200 rounded p-1 resize-none bg-gray-50 mt-1 text-black"
          rows={3}
          placeholder="Enter prompt for AI..."
        />
      )}

      {!isSelected && (
        <div className="text-xs text-gray-700 truncate max-w-[160px]">
          {data.prompt || "No prompt set"}
        </div>
      )}

      <div className="flex justify-between mt-2 px-2">
        <span className="text-[10px] font-bold text-green-600">YES</span>
        <span className="text-[10px] font-bold text-red-600">NO</span>
      </div>

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
