"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSchema } from "@/hooks/use-schema";
import { useSemanticLayer, useUpdateSemanticLayer } from "@/hooks/use-semantic";
import type { RelationshipSemantic } from "@/lib/types";

const emptyDraft: Partial<RelationshipSemantic> = {
  cardinality: "many-to-one",
  from_table: "",
  from_column: "",
  to_table: "",
  to_column: "",
};

export function RelationshipEditor({ connectionId }: { connectionId: string }) {
  const [open, setOpen] = useState(false);
  const { data: schema } = useSchema(connectionId);
  const { data: layer, isLoading: layerLoading, isError: layerError } = useSemanticLayer(connectionId);
  const updateMutation = useUpdateSemanticLayer(connectionId);

  const [relationships, setRelationships] = useState<RelationshipSemantic[]>([]);
  const [draft, setDraft] = useState<Partial<RelationshipSemantic>>(emptyDraft);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen && layer) setRelationships(layer.relationships ?? []);
  };

  const columnsFor = (tableName: string | undefined) =>
    schema?.tables.find((t) => t.name === tableName)?.columns.map((c) => c.name) ?? [];

  const addRelationship = () => {
    if (!draft.from_table || !draft.from_column || !draft.to_table || !draft.to_column) return;
    setRelationships((prev) => [
      ...prev,
      {
        from_table: draft.from_table!,
        from_column: draft.from_column!,
        to_table: draft.to_table!,
        to_column: draft.to_column!,
        cardinality: (draft.cardinality as RelationshipSemantic["cardinality"]) ?? "many-to-one",
        description: "",
      },
    ]);
    setDraft(emptyDraft);
  };

  const removeRelationship = (index: number) => setRelationships((prev) => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    if (!layer) return;
    updateMutation.mutate({ ...layer, relationships }, { onSuccess: () => setOpen(false) });
  };

  const tableNames = schema?.tables.map((t) => t.name) ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button variant="outline" size="sm" onClick={() => handleOpenChange(true)}>
        Manage relationships
      </Button>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Table relationships</DialogTitle></DialogHeader>

        {layerLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {layerError && (
          <Alert variant="destructive">
            <AlertDescription>No semantic layer found yet — draft one from the Tables page first.</AlertDescription>
          </Alert>
        )}

        {layer && (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Cardinality</TableHead><TableHead /></TableRow>
              </TableHeader>
              <TableBody>
                {relationships.map((rel, i) => (
                  <TableRow key={i}>
                    <TableCell>{rel.from_table}.{rel.from_column}</TableCell>
                    <TableCell>{rel.to_table}.{rel.to_column}</TableCell>
                    <TableCell>{rel.cardinality}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-sm" onClick={() => removeRelationship(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {relationships.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No relationships yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>

            <div className="grid grid-cols-5 items-end gap-2 rounded-md border p-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">From table</label>
                <Select
                  value={draft.from_table}
                  onValueChange={(v) => v && setDraft((d) => ({ ...d, from_table: v, from_column: "" }))}
                >
                  <SelectTrigger><SelectValue placeholder="Table" /></SelectTrigger>
                  <SelectContent>{tableNames.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">From column</label>
                <Select
                  value={draft.from_column}
                  onValueChange={(v) => v && setDraft((d) => ({ ...d, from_column: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Column" /></SelectTrigger>
                  <SelectContent>{columnsFor(draft.from_table).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">To table</label>
                <Select
                  value={draft.to_table}
                  onValueChange={(v) => v && setDraft((d) => ({ ...d, to_table: v, to_column: "" }))}
                >
                  <SelectTrigger><SelectValue placeholder="Table" /></SelectTrigger>
                  <SelectContent>{tableNames.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">To column</label>
                <Select
                  value={draft.to_column}
                  onValueChange={(v) => v && setDraft((d) => ({ ...d, to_column: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Column" /></SelectTrigger>
                  <SelectContent>{columnsFor(draft.to_table).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Cardinality</label>
                <Select
                  value={draft.cardinality}
                  onValueChange={(v) => v && setDraft((d) => ({ ...d, cardinality: v as RelationshipSemantic["cardinality"] }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-to-one">1:1</SelectItem>
                    <SelectItem value="many-to-one">N:1</SelectItem>
                    <SelectItem value="many-to-many">N:N</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={addRelationship}>Add relationship</Button>

            {updateMutation.error && (
              <Alert variant="destructive"><AlertDescription>{updateMutation.error.message}</AlertDescription></Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!layer || updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save relationships"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}