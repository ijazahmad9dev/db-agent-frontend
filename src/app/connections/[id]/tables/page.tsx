"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTables, useSelectedTables, useSelectTables, useDraftSemanticLayer } from "@/hooks/use-tables";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TableSelectionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: selected } = useSelectedTables(id);
  const selectMutation = useSelectTables(id);
  const draftMutation = useDraftSemanticLayer(id);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const { data: allTables, isLoading, isError: tablesError } = useTables(id);

  useEffect(() => {
    if (selected?.table_names) setChecked(new Set(selected.table_names));
  }, [selected]);
  
  if (tablesError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load tables for this connection. Is it still reachable?</AlertDescription>
      </Alert>
    );
  }
  const toggle = (table: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(table) ? next.delete(table) : next.add(table);
      return next;
    });
  };

  const handleSave = () => {
    selectMutation.mutate(Array.from(checked), {
      onSuccess: () => draftMutation.mutate(undefined, { onSuccess: () => router.push(`/connections/${id}/chat`) }),
    });
  };

  if (isLoading) return <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}</div>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Select tables</h1>
        <p className="text-sm text-muted-foreground">Choose which tables the agent is allowed to use.</p>
      </div>

      <Card>
        <CardContent className="divide-y pt-6">
          {allTables?.tables.map((table) => (
            <label key={table} className="flex items-center gap-3 py-2 cursor-pointer">
              <Checkbox checked={checked.has(table)} onCheckedChange={() => toggle(table)} />
              <span>{table}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      {(selectMutation.error || draftMutation.error) && (
        <Alert variant="destructive">
          <AlertDescription>{(selectMutation.error ?? draftMutation.error)?.message}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleSave} disabled={checked.size === 0 || selectMutation.isPending || draftMutation.isPending}>
        {draftMutation.isPending ? "Drafting semantic layer..." : selectMutation.isPending ? "Saving..." : `Save selection (${checked.size})`}
      </Button>
    </div>
  );
}