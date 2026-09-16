"use client";

import { useFlowStore } from "../../lib/store";
import { Badge } from "../ui/badge";

export default function ExecutionLogPanel() {
  const executionLog = useFlowStore((s) => s.executionLog);
  const runStatus = useFlowStore((s) => s.runStatus);
  const totalAttempts = useFlowStore((s) => s.totalAttempts);

  return (
    <div className="w-80 border-l bg-white p-4 overflow-y-auto">
      <h2 className="font-bold text-lg mb-4 text-black">Execution Log</h2>
      <div className="mb-4 flex gap-2 items-center">
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
        {totalAttempts > 0 && (
          <span className="text-xs text-gray-500">
            {totalAttempts} attempt{totalAttempts > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="relative">
        {executionLog.length === 0 && (
          <p className="text-sm text-gray-600">No execution logs yet.</p>
        )}

        {executionLog.length > 0 && (
          <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-200" />
        )}

        {executionLog.map((step, i) => {
          const isLast = i === executionLog.length - 1;
          return (
            <div key={i} className="relative flex gap-3 pb-4">
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                  step.failed
                    ? "bg-orange-500"
                    : step.result === "YES"
                    ? "bg-green-500"
                    : "bg-red-500"
                } ${isLast ? "ring-2 ring-offset-2 ring-blue-400" : ""}`}
              >
                {step.attempt > 1 ? step.attempt : i + 1}
              </div>
              <div
                className={`flex-1 border rounded-lg p-3 text-sm ${
                  isLast
                    ? "border-blue-300 bg-blue-50"
                    : step.failed
                    ? "border-orange-300 bg-orange-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-black">{step.label}</span>
                  <div className="flex gap-1">
                    {step.attempt > 1 && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Retry {step.attempt}
                      </Badge>
                    )}
                    <Badge
                      variant={step.failed ? "destructive" : step.result === "YES" ? "default" : "destructive"}
                    >
                      {step.failed ? "FAILED" : step.result}
                    </Badge>
                  </div>
                </div>
                <div className="text-gray-700 text-xs">{step.prompt}</div>
                <div className="text-gray-500 text-[10px] mt-1">
                  {new Date(step.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
