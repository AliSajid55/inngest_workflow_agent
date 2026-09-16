"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const FlowEditor = dynamic(
  () => import("../components/flow/FlowEditor"),
  { ssr: false }
);

const Toolbar = dynamic(
  () => import("../components/panels/Toolbar"),
  { ssr: false }
);

const ExecutionLogPanel = dynamic(
  () => import("../components/panels/ExecutionLogPanel"),
  { ssr: false }
);

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex gap-2 p-4 border-b bg-white items-center h-[57px]">
          <div className="w-16 h-8 bg-gray-100 rounded animate-pulse" />
          <div className="w-16 h-8 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 bg-gray-50" />
          <div className="w-80 border-l bg-white p-4">
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse mb-4" />
          </div>
        </div>
      </div>
    );
  }

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
