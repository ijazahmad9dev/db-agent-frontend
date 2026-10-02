import { Handle, Position } from "@xyflow/react";
import type { ERDNode } from "@/lib/types";

type TableNodeData = ERDNode & { onSelect?: (tableName: string) => void };

export function TableNode({ data }: { data: TableNodeData }) {
  return (
    <div
      className="min-w-[200px] cursor-pointer rounded-md border bg-background shadow-sm transition-colors hover:border-primary"
      onClick={() => data.onSelect?.(data.name)}
      title="Click to view and edit business name & description"
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div className="rounded-t-md bg-muted px-3 py-1.5 text-sm font-semibold">{data.name}</div>
      <div className="divide-y">
        {data.columns.map((col) => (
          <div key={col.name} className="flex items-center justify-between gap-3 px-3 py-1 text-xs">
            <span className={col.is_primary_key ? "font-semibold" : ""}>
              {col.is_primary_key && "🔑 "}
              {col.is_foreign_key && "🔗 "}
              {col.name}
            </span>
            <span className="whitespace-nowrap text-muted-foreground">{col.data_type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}