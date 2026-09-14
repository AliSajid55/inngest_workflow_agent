"use client";

import { Button } from "../ui/button";

export default function Toolbar() {
  return (
    <div className="flex gap-2 p-4 border-b bg-white">
      <Button size="sm">Add Node</Button>
      <Button size="sm" variant="outline">
        Run
      </Button>
    </div>
  );
}
