"use client";

import { useMemo } from "react";
import { ReactFlow, Background, Controls, MiniMap, MarkerType, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TableNode } from "./table-node";
import type { ERDResponse } from "@/lib/types";

const nodeTypes = { table: TableNode };

const CARDINALITY_LABEL: Record<string, string> = {
  "one-to-one": "1 : 1",
  "many-to-one": "N : 1",
  "many-to-many": "N : N",
};

export function ERDViewer({ erd }: { erd: ERDResponse }) {
  const { nodes, edges } = useMemo(() => {
    const cols = 3;
    const nodes: Node[] = erd.nodes.map((n, i) => ({
      id: n.name,
      type: "table",
      position: { x: (i % cols) * 300, y: Math.floor(i / cols) * 260 },
      data: n,
    }));

    const edges: Edge[] = erd.edges.map((e, i) => ({
      id: `e${i}-${e.from_table}.${e.from_column}-${e.to_table}.${e.to_column}`,
      source: e.from_table,
      target: e.to_table,
      label: `${CARDINALITY_LABEL[e.cardinality] ?? e.cardinality}  (${e.from_column} → ${e.to_column})`,
      animated: e.source === "fk",
      style: e.source === "semantic" ? { strokeDasharray: "5 5" } : undefined,
      markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
      labelStyle: { fontSize: 11, fontWeight: 500 },
      labelBgPadding: [4, 2],
      labelBgStyle: { fill: "white" },
    }));

    return { nodes, edges };
  }, [erd]);

  return (
    <div className="h-[70vh] w-full rounded-md border">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}