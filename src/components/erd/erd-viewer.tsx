"use client";

import { useMemo } from "react";
import { ReactFlow, Background, Controls, MiniMap, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TableNode } from "./table-node";
import type { ERDResponse, ERDEdge } from "@/lib/types";

const nodeTypes = { table: TableNode };

// Full Information Engineering (crow's-foot) notation: a bar means "one", a fork
// means "many"; a circle ahead of either means that side is optional (zero), its
// absence means mandatory (at least one). Four combinations cover every case:
// exactly-one, zero-or-one, one-or-many, zero-or-many.
const MARKER_DEFS = (
  <svg style={{ position: "absolute", width: 0, height: 0 }}>
    <defs>
      <marker id="erd-one" viewBox="0 0 14 10" refX="12" refY="5" markerWidth="14" markerHeight="10" orient="auto-start-reverse">
        <line x1="12" y1="0" x2="12" y2="10" stroke="currentColor" strokeWidth="1.5" />
      </marker>
      <marker id="erd-one-optional" viewBox="0 0 20 10" refX="18" refY="5" markerWidth="20" markerHeight="10" orient="auto-start-reverse">
        <line x1="16" y1="0" x2="16" y2="10" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="7" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </marker>
      <marker id="erd-many" viewBox="0 0 20 10" refX="18" refY="5" markerWidth="20" markerHeight="10" orient="auto-start-reverse">
        <path d="M18,5 L8,0 M18,5 L8,5 M18,5 L8,10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="6" y1="0" x2="6" y2="10" stroke="currentColor" strokeWidth="1.5" />
      </marker>
      <marker id="erd-many-optional" viewBox="0 0 24 10" refX="22" refY="5" markerWidth="24" markerHeight="10" orient="auto-start-reverse">
        <path d="M22,5 L12,0 M22,5 L12,5 M22,5 L12,10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="6" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </marker>
    </defs>
  </svg>
);

function markerId(isMany: boolean, isOptional: boolean): string {
  if (isMany) return isOptional ? "erd-many-optional" : "erd-many";
  return isOptional ? "erd-one-optional" : "erd-one";
}

function markersFor(e: ERDEdge): { markerStart: string; markerEnd: string } {
  // React Flow wraps whatever string you pass here in url('#...') itself —
  // pass the bare marker id, NOT an already-wrapped url(#id) string, or the
  // result is a double-wrapped, non-matching value and nothing renders at all.
  const fromIsMany = e.cardinality === "many-to-one" || e.cardinality === "many-to-many";
  const toIsMany = e.cardinality === "many-to-many";
  return {
    markerStart: markerId(fromIsMany, e.from_optional),
    markerEnd: markerId(toIsMany, e.to_optional),
  };
}

export function ERDViewer({ erd }: { erd: ERDResponse }) {
  const { nodes, edges } = useMemo(() => {
    const cols = 3;
    const nodes: Node[] = erd.nodes.map((n, i) => ({
      id: n.name,
      type: "table",
      position: { x: (i % cols) * 300, y: Math.floor(i / cols) * 260 },
      data: n,
    }));

    const edges: Edge[] = erd.edges.map((e, i) => {
      const { markerStart, markerEnd } = markersFor(e);
      return {
        id: `e${i}-${e.from_table}.${e.from_column}-${e.to_table}.${e.to_column}`,
        source: e.from_table,
        target: e.to_table,
        animated: e.source === "fk",
        style: { stroke: "currentColor", ...(e.source === "semantic" ? { strokeDasharray: "5 5" } : {}) },
        markerStart,
        markerEnd,
      };
    });

    return { nodes, edges };
  }, [erd]);

  return (
    <div className="relative h-[70vh] w-full rounded-md border text-muted-foreground">
      {MARKER_DEFS}
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}