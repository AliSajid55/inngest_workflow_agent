"use client";

import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { useFlowStore } from "../../lib/store";
import { runWorkflow, getRunStatus } from "../../lib/api";

export default function Toolbar() {
  const addNode = useFlowStore((s) => s.addNode);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const setNodes = useFlowStore((s) => s.setNodes);
  const setEdges = useFlowStore((s) => s.setEdges);
  const setRunId = useFlowStore((s) => s.setRunId);
  const setRunStatus = useFlowStore((s) => s.setRunStatus);
  const setExecutionLog = useFlowStore((s) => s.setExecutionLog);
  const setTotalAttempts = useFlowStore((s) => s.setTotalAttempts);
  const runStatus = useFlowStore((s) => s.runStatus);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            setTotalAttempts(status.totalAttempts);
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

  const handleSave = (name: string) => {
    const savedWorkflows = JSON.parse(localStorage.getItem("saved-workflows") || "{}");
    savedWorkflows[name] = { nodes, edges, savedAt: new Date().toISOString() };
    localStorage.setItem("saved-workflows", JSON.stringify(savedWorkflows));
    setShowSaveMenu(false);
  };

  const handleLoad = (name: string) => {
    const savedWorkflows = JSON.parse(localStorage.getItem("saved-workflows") || "{}");
    const workflow = savedWorkflows[name];
    if (workflow) {
      setNodes(workflow.nodes);
      setEdges(workflow.edges);
    }
    setShowLoadMenu(false);
  };

  const handleDelete = (name: string) => {
    const savedWorkflows = JSON.parse(localStorage.getItem("saved-workflows") || "{}");
    delete savedWorkflows[name];
    localStorage.setItem("saved-workflows", JSON.stringify(savedWorkflows));
    setShowLoadMenu(false);
  };

  const handleExportJSON = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const savedWorkflows = JSON.parse(
    typeof window !== "undefined" ? localStorage.getItem("saved-workflows") || "{}" : "{}"
  );
  const savedNames = Object.keys(savedWorkflows);

  return (
    <div className="flex gap-2 p-4 border-b bg-white items-center flex-wrap">
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

      <div className="h-6 w-px bg-gray-300 mx-1" />

      <div className="relative">
        <Button size="sm" variant="outline" onClick={() => { setShowSaveMenu(!showSaveMenu); setShowLoadMenu(false); }}>
          Save
        </Button>
        {showSaveMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-50 p-2 min-w-[200px]">
            <div className="text-xs text-gray-500 mb-2">Enter name:</div>
            <SaveInput onSave={handleSave} />
          </div>
        )}
      </div>

      <div className="relative">
        <Button size="sm" variant="outline" onClick={() => { setShowLoadMenu(!showLoadMenu); setShowSaveMenu(false); }} disabled={savedNames.length === 0}>
          Load
        </Button>
        {showLoadMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-50 p-2 min-w-[200px]">
            {savedNames.length === 0 ? (
              <div className="text-xs text-gray-500">No saved workflows</div>
            ) : (
              savedNames.map((name) => (
                <div key={name} className="flex items-center justify-between p-1 hover:bg-gray-100 rounded">
                  <button className="text-sm text-left flex-1" onClick={() => handleLoad(name)}>
                    {name}
                  </button>
                  <button className="text-xs text-red-500 ml-2" onClick={() => handleDelete(name)}>
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      <Button size="sm" variant="outline" onClick={handleExportJSON} disabled={nodes.length === 0}>
        Export JSON
      </Button>
      <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
        Import JSON
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportJSON}
      />

      <div className="text-xs text-gray-700 ml-auto">
        {nodes.length} node(s), {edges.length} edge(s)
      </div>
    </div>
  );
}

function SaveInput({ onSave }: { onSave: (name: string) => void }) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-1">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Workflow name"
        className="flex-1 px-2 py-1 text-sm border rounded"
        autoFocus
      />
      <Button type="submit" size="sm" disabled={!name.trim()}>
        Save
      </Button>
    </form>
  );
}
