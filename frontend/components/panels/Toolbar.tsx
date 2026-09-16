"use client";

import { Button } from "../ui/button";
import { useFlowStore } from "../../lib/store";
import { runWorkflow, getRunStatus } from "../../lib/api";

export default function Toolbar() {
  const addNode = useFlowStore((s) => s.addNode);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const setRunId = useFlowStore((s) => s.setRunId);
  const setRunStatus = useFlowStore((s) => s.setRunStatus);
  const setExecutionLog = useFlowStore((s) => s.setExecutionLog);
  const runStatus = useFlowStore((s) => s.runStatus);

  const handleRun = async () => {
    if (nodes.length === 0) return;

    const startNodeId = nodes[0]?.id;
    if (!startNodeId) return;

    setRunStatus("running");
    setExecutionLog([]);

    try {
      const { runId } = await runWorkflow({
        nodes,
        edges,
        startNodeId,
        inputText: "Test input",
      });

      setRunId(runId);

      const pollInterval = setInterval(async () => {
        try {
          const status = await getRunStatus(runId);
          if (status.status !== "running") {
            setRunStatus(status.status);
            setExecutionLog(status.log);
            clearInterval(pollInterval);
          }
        } catch {
          clearInterval(pollInterval);
          setRunStatus("failed");
        }
      }, 1000);
    } catch {
      setRunStatus("failed");
    }
  };

  return (
    <div className="flex gap-2 p-4 border-b bg-white items-center">
      <Button size="sm" onClick={addNode} className="!bg-black !text-white">
        Add Node
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleRun}
        disabled={nodes.length === 0 || runStatus === "running"}
      >
        {runStatus === "running" ? "Running..." : "Run"}
      </Button>
      <div className="text-xs text-gray-700 ml-auto">
        {nodes.length} node(s), {edges.length} edge(s)
      </div>
    </div>
  );
}
