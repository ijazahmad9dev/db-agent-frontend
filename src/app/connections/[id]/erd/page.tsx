"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useERD } from "@/hooks/use-erd";
import { useSelectedTables } from "@/hooks/use-tables";
import { useConnections } from "@/hooks/use-connections";
import { ERDViewer } from "@/components/erd/erd-viewer";
import { RelationshipEditor } from "@/components/erd/relationship-editor";
import { TableDetailsEditor } from "@/components/erd/table-details-editor";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ERDPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: selected, isLoading: selectionLoading } = useSelectedTables(id);
  const hasSelection = (selected?.table_names?.length ?? 0) > 0;
  const { data: erd, isLoading, isError } = useERD(id, undefined, { enabled: hasSelection });
  const { data: connections } = useConnections();
  const connection = connections?.find((c) => c.id === id);

  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  useEffect(() => {
    if (!selectionLoading && !hasSelection) router.replace(`/connections/${id}/tables`);
  }, [selectionLoading, hasSelection, id, router]);

  if (selectionLoading || !hasSelection) return <Skeleton className="h-[70vh] w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Entity Relationship Diagram</h1>
          <p className="text-sm text-muted-foreground">
            Click a table to review or edit its business name and description.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {connection && <RelationshipEditor connectionId={id} sourceType={connection.source_type} />}
          <Button onClick={() => router.push(`/connections/${id}/chat`)}>
            Continue to Chat <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading && <Skeleton className="h-[70vh] w-full" />}
      {isError && <Alert variant="destructive"><AlertDescription>Failed to load ERD for this connection.</AlertDescription></Alert>}
      {erd && erd.nodes.length === 0 && <p className="text-sm text-muted-foreground">No tables found for this connection.</p>}
      {erd && erd.nodes.length > 0 && <ERDViewer erd={erd} onSelectTable={setSelectedTable} />}

      <TableDetailsEditor
        connectionId={id}
        tableName={selectedTable}
        open={selectedTable !== null}
        onOpenChange={(open) => !open && setSelectedTable(null)}
      />
    </div>
  );
}