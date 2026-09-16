"use client";

import { useFlowStore } from "../../lib/store";
import { Badge } from "../ui/badge";

export default function ExecutionLogPanel() {
  const executionLog = useFlowStore((s) => s.executionLog);
  const runStatus = useFlowStore((s) => s.runStatus);

  return (
    <div className="w-80 border-l bg-white p-4 overflow-y-auto">
      <h2 className="font-bold text-lg mb-4 text-black">Execution Log</h2>
      <div className="mb-4">
        <Badge
          variant={
            runStatus === "completed"
              ? "default"
              : runStatus === "failed"
              ? "destructive"
              : "secondary"
          }
        >
          {runStatus}
        </Badge>
      </div>
      <div className="space-y-3">
        {executionLog.length === 0 && (
          <p className="text-sm text-gray-600">No execution logs yet.</p>
        )}
        {executionLog.map((step, i) => (
          <div key={i} className="p-3 border rounded-lg text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">{step.label}</span>
              <Badge
                variant={step.result === "YES" ? "default" : "destructive"}
              >
                {step.result}
              </Badge>
            </div>
            <div className="text-gray-700 text-xs">{step.prompt}</div>
            <div className="text-gray-600 text-[10px] mt-1">{step.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
