"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useERD } from "@/hooks/use-erd";
import { useSelectedTables } from "@/hooks/use-tables";
import { useConnections } from "@/hooks/use-connections";
import { ERDViewer } from "@/components/erd/erd-viewer";
import { RelationshipEditor } from "@/components/erd/relationship-editor";
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

  useEffect(() => {
    if (!selectionLoading && !hasSelection) router.replace(`/connections/${id}/tables`);
  }, [selectionLoading, hasSelection, id, router]);

  if (selectionLoading || !hasSelection) return <Skeleton className="h-[70vh] w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Entity Relationship Diagram</h1>
        {connection && <RelationshipEditor connectionId={id} sourceType={connection.source_type} />}
      </div>

      {isLoading && <Skeleton className="h-[70vh] w-full" />}
      {isError && <Alert variant="destructive"><AlertDescription>Failed to load ERD for this connection.</AlertDescription></Alert>}
      {erd && erd.nodes.length === 0 && <p className="text-sm text-muted-foreground">No tables found for this connection.</p>}
      {erd && erd.nodes.length > 0 && <ERDViewer erd={erd} />}
    </div>
  );
}