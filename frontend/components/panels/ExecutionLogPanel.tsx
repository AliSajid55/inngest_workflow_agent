"use client";

import { useFlowStore } from "../../lib/store";
import { Badge } from "../ui/badge";

export default function ExecutionLogPanel() {
  const executionLog = useFlowStore((s) => s.executionLog);
  const runStatus = useFlowStore((s) => s.runStatus);

  return (
    <div className="w-80 border-l bg-white p-4 overflow-y-auto">
      <h2 className="font-bold text-lg mb-4">Execution Log</h2>
      <Badge variant={runStatus === "running" ? "default" : "secondary"}>
        {runStatus}
      </Badge>
      <div className="mt-4 space-y-3">
        {executionLog.map((step, i) => (
          <div key={i} className="p-3 border rounded-lg text-sm">
            <div className="font-medium">{step.label}</div>
            <div className="text-gray-500 text-xs mt-1">{step.prompt}</div>
            <Badge
              variant={step.result === "YES" ? "default" : "destructive"}
              className="mt-2"
            >
              {step.result}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
