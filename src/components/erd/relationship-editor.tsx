"use client";

import { useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useSchema } from "@/hooks/use-schema";
import { useERD } from "@/hooks/use-erd";
import { useUpdateRelationships } from "@/hooks/use-semantic";
import type { RelationshipSemantic, RelationshipKey, SourceType } from "@/lib/types";

const emptyDraft: Partial<RelationshipSemantic> = {
  cardinality: "many-to-one",
  from_table: "",
  from_column: "",
  to_table: "",
  to_column: "",
  from_optional: true,
  to_optional: true,
};

const sameKey = (a: RelationshipKey, b: RelationshipKey) =>
  a.from_table === b.from_table && a.from_column === b.from_column &&
  a.to_table === b.to_table && a.to_column === b.to_column;

const EDITABLE_SOURCE_TYPES: SourceType[] = ["postgres", "mysql"];

export function RelationshipEditor({ connectionId, sourceType }: { connectionId: string; sourceType: SourceType }) {
  const [open, setOpen] = useState(false);
  const { data: schema } = useSchema(connectionId);
  const { data: erd, isLoading: erdLoading } = useERD(connectionId, undefined, { enabled: open });
  const updateMutation = useUpdateRelationships(connectionId);

  const [overrides, setOverrides] = useState<RelationshipSemantic[]>([]);
  const [removedKeys, setRemovedKeys] = useState<RelationshipKey[]>([]);
  const [draft, setDraft] = useState<Partial<RelationshipSemantic>>(emptyDraft);
  const [editingKey, setEditingKey] = useState<RelationshipKey | null>(null);

  const editable = EDITABLE_SOURCE_TYPES.includes(sourceType);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setOverrides([]);
      setRemovedKeys([]);
      setDraft(emptyDraft);
      setEditingKey(null);
    }
  };

  const columnsFor = (tableName: string | undefined) =>
    schema?.tables.find((t) => t.name === tableName)?.columns.map((c) => c.name) ?? [];

  const displayedRows: RelationshipSemantic[] = (() => {
    const rows: RelationshipSemantic[] = (erd?.edges ?? []).map((e) => ({
      from_table: e.from_table, from_column: e.from_column,
      to_table: e.to_table, to_column: e.to_column, cardinality: e.cardinality,
      description: "", from_optional: e.from_optional, to_optional: e.to_optional,
    }));
    for (const rel of overrides) {
      const i = rows.findIndex((r) => sameKey(r, rel));
      if (i >= 0) rows[i] = rel; else rows.push(rel);
    }
    return rows.filter((r) => !removedKeys.some((k) => sameKey(k, r)));
  })();

  const startEdit = (row: RelationshipSemantic) => {
    setEditingKey(row);
    setDraft(row);
  };

  const removeRelationship = (row: RelationshipKey) => {
    setOverrides((prev) => prev.filter((r) => !sameKey(r, row)));
    setRemovedKeys((prev) => (prev.some((k) => sameKey(k, row)) ? prev : [...prev, row]));
  };

  const saveDraft = () => {
    if (!draft.from_table || !draft.from_column || !draft.to_table || !draft.to_column) return;
    const rel: RelationshipSemantic = {
      from_table: draft.from_table, from_column: draft.from_column,
      to_table: draft.to_table, to_column: draft.to_column,
      cardinality: (draft.cardinality as RelationshipSemantic["cardinality"]) ?? "many-to-one",
      description: draft.description ?? "",
      from_optional: draft.from_optional ?? true,
      to_optional: draft.to_optional ?? true,
    };
    setOverrides((prev) => {
      const i = prev.findIndex((r) => sameKey(r, rel));
      if (i >= 0) { const next = [...prev]; next[i] = rel; return next; }
      return [...prev, rel];
    });
    setRemovedKeys((prev) => prev.filter((k) => !sameKey(k, rel)));
    setDraft(emptyDraft);
    setEditingKey(null);
  };

  const handleSave = () => {
    updateMutation.mutate(
      { relationships: overrides, removed_relationships: removedKeys },
      { onSuccess: () => setOpen(false) }
    );
  };

  const tableNames = schema?.tables.map((t) => t.name) ?? [];

  // if (!editable) {
  //   return (
  //     <Button variant="outline" size="sm" disabled title="Relationship editing is only available for Postgres/MySQL connections">
  //       Manage relationships
  //     </Button>
  //   );
  // }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* <Button variant="outline" size="sm" onClick={() => handleOpenChange(true)}>
        Manage relationships
      </Button> */}
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Table relationships</DialogTitle></DialogHeader>

        {erdLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

        {/* min-w-0 is required here: DialogContent is a CSS grid, and grid/flex items
            default to min-width:auto — meaning they refuse to shrink below their content's
            natural width even with overflow-x-auto set. Without this, the table below just
            pushes past the dialog's edge instead of scrolling internally. */}
        <div className="min-w-0 space-y-4">
          <p className="text-xs text-muted-foreground">
            These changes only affect this app&apos;s view and how questions get answered — nothing is
            changed in your actual database.
          </p>

          <div className="min-w-0 overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Cardinality</TableHead>
                  <TableHead>Participation</TableHead><TableHead>Source</TableHead><TableHead /></TableRow>
              </TableHeader>
              <TableBody>
                {displayedRows.map((rel, i) => {
                  const isOverride = overrides.some((r) => sameKey(r, rel));
                  return (
                    <TableRow key={i}>
                      <TableCell className="whitespace-nowrap">{rel.from_table}.{rel.from_column}</TableCell>
                      <TableCell className="whitespace-nowrap">{rel.to_table}.{rel.to_column}</TableCell>
                      <TableCell className="whitespace-nowrap">{rel.cardinality}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {rel.from_optional ? "zero" : "one"} → {rel.to_optional ? "zero" : "one"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap"><Badge variant={isOverride ? "secondary" : "outline"}>{isOverride ? "custom" : "detected"}</Badge></TableCell>
                      <TableCell className="flex gap-1 whitespace-nowrap">
                        <Button variant="ghost" size="icon-sm" onClick={() => startEdit(rel)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => removeRelationship(rel)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {displayedRows.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No relationships</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* flex-wrap instead of a grid+breakpoint combo: this reflows based on the
              dialog's ACTUAL available width, not the browser viewport width — sm:/md:
              breakpoints track the viewport, which has no fixed relationship to how wide
              this dialog itself ends up being. */}
          <div className="flex flex-wrap items-end gap-2 rounded-md border p-3">
            <div className="min-w-[140px] flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">From table</label>
              <Select value={draft.from_table} onValueChange={(v) => v && setDraft((d) => ({ ...d, from_table: v, from_column: "" }))}>
                <SelectTrigger><SelectValue placeholder="Table" /></SelectTrigger>
                <SelectContent>{tableNames.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="min-w-[140px] flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">From column</label>
              <Select value={draft.from_column} onValueChange={(v) => v && setDraft((d) => ({ ...d, from_column: v }))}>
                <SelectTrigger><SelectValue placeholder="Column" /></SelectTrigger>
                <SelectContent>{columnsFor(draft.from_table).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="min-w-[140px] flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">To table</label>
              <Select value={draft.to_table} onValueChange={(v) => v && setDraft((d) => ({ ...d, to_table: v, to_column: "" }))}>
                <SelectTrigger><SelectValue placeholder="Table" /></SelectTrigger>
                <SelectContent>{tableNames.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="min-w-[140px] flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">To column</label>
              <Select value={draft.to_column} onValueChange={(v) => v && setDraft((d) => ({ ...d, to_column: v }))}>
                <SelectTrigger><SelectValue placeholder="Column" /></SelectTrigger>
                <SelectContent>{columnsFor(draft.to_table).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="min-w-[120px] flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">Cardinality</label>
              <Select value={draft.cardinality} onValueChange={(v) => v && setDraft((d) => ({ ...d, cardinality: v as RelationshipSemantic["cardinality"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-to-one">1:1</SelectItem>
                  <SelectItem value="many-to-one">N:1</SelectItem>
                  <SelectItem value="many-to-many">N:N</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex min-w-[160px] flex-1 items-center gap-3 pb-2">
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={draft.from_optional ?? true}
                  onChange={(e) => setDraft((d) => ({ ...d, from_optional: e.target.checked }))}
                />
                From optional
              </label>
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={draft.to_optional ?? true}
                  onChange={(e) => setDraft((d) => ({ ...d, to_optional: e.target.checked }))}
                />
                To optional
              </label>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={saveDraft}>
            {editingKey ? "Update relationship" : "Add relationship"}
          </Button>

          {updateMutation.error && (
            <Alert variant="destructive"><AlertDescription>{updateMutation.error.message}</AlertDescription></Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save relationships"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}