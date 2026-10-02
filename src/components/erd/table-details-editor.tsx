"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSemanticLayer, useUpdateSemanticLayer } from "@/hooks/use-semantic";
import type { TableSemantic } from "@/lib/types";

export function TableDetailsEditor({
  connectionId,
  tableName,
  open,
  onOpenChange,
}: {
  connectionId: string;
  tableName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: layer, isLoading } = useSemanticLayer(connectionId);
  const updateMutation = useUpdateSemanticLayer(connectionId);
  const [draft, setDraft] = useState<TableSemantic | null>(null);

  useEffect(() => {
    if (open && tableName && layer?.tables[tableName]) {
      // Deep-clone so edits don't mutate the cached query data directly.
      setDraft(JSON.parse(JSON.stringify(layer.tables[tableName])));
    }
    if (!open) setDraft(null);
  }, [open, tableName, layer]);

  const handleSave = () => {
    if (!layer || !tableName || !draft) return;
    // PUT /semantic replaces the whole layer, but the backend preserves
    // relationships/removed_relationships untouched regardless of what's sent here
    // (see api/routes/semantic.py) — so this can safely update just this one
    // table's entry without any risk of clobbering relationship data.
    const updatedLayer = {
      ...layer,
      tables: { ...layer.tables, [tableName]: draft },
    };
    updateMutation.mutate(updatedLayer, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* sm:max-w-2xl (not max-w-2xl) overrides DialogContent's own sm:max-w-sm —
          see relationship-editor.tsx for why the modifier has to match. min-w-0
          lets the content actually shrink/scroll instead of pushing past the dialog. */}
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{tableName}</DialogTitle></DialogHeader>

        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

        {draft && (
          <div className="min-w-0 space-y-4">
            <p className="text-xs text-muted-foreground">
              These names and descriptions help the agent understand your data when
              answering questions. Saving updates the semantic layer immediately.
            </p>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Business name</label>
              <Input
                value={draft.business_name}
                onChange={(e) => setDraft((d) => d && { ...d, business_name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Description</label>
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft((d) => d && { ...d, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="min-w-0 space-y-3 rounded-md border p-3">
              <p className="text-xs font-medium text-muted-foreground">Columns</p>
              {Object.entries(draft.columns).map(([colKey, col]) => (
                <div key={colKey} className="flex flex-wrap items-start gap-2 border-t pt-3 first:border-t-0 first:pt-0">
                  <div className="w-[110px] shrink-0 truncate pt-2 font-mono text-sm text-muted-foreground" title={col.original_name}>
                    {col.original_name}
                  </div>
                  <Input
                    className="min-w-[160px] flex-1"
                    placeholder="Business name"
                    value={col.business_name}
                    onChange={(e) =>
                      setDraft((d) => d && {
                        ...d,
                        columns: { ...d.columns, [colKey]: { ...col, business_name: e.target.value } },
                      })
                    }
                  />
                  <Input
                    className="min-w-[160px] flex-1"
                    placeholder="Description"
                    value={col.description}
                    onChange={(e) =>
                      setDraft((d) => d && {
                        ...d,
                        columns: { ...d.columns, [colKey]: { ...col, description: e.target.value } },
                      })
                    }
                  />
                </div>
              ))}
            </div>

            {updateMutation.error && (
              <Alert variant="destructive"><AlertDescription>{updateMutation.error.message}</AlertDescription></Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!draft || updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}