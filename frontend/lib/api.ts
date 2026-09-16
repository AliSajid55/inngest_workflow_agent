import { WorkflowRunInput, RunStatus } from "./types";

export async function runWorkflow(
  input: WorkflowRunInput
): Promise<{ runId: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/runs`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nodes: input.nodes,
        edges: input.edges,
        start_node_id: input.startNodeId,
        input_text: input.inputText,
      }),
    }
  );
  const data = await res.json();
  return { runId: data.run_id };
}

export async function getRunStatus(runId: string): Promise<RunStatus> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/runs/${runId}`
  );
  const data = await res.json();
  return {
    runId: data.run_id,
    status: data.status,
    log: (data.log || []).map((step: Record<string, unknown>) => ({
      nodeId: step.node_id,
      label: step.label,
      prompt: step.prompt,
      result: step.result,
      timestamp: step.timestamp,
    })),
  };
}
