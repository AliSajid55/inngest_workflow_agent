"use client";

import FlowEditor from "../components/flow/FlowEditor";
import Toolbar from "../components/panels/Toolbar";
import ExecutionLogPanel from "../components/panels/ExecutionLogPanel";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <FlowEditor />
        </div>
        <ExecutionLogPanel />
      </div>
    </div>
  );
}
