"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryViewer } from "./query-viewer";
import { ResultTable } from "./result-table";
import { ChartCarousel } from "./chart-carousel";
import type { ChatResponse } from "@/lib/types";

export function ChatResultDialog({
  response,
  open,
  onOpenChange,
}: {
  response: ChatResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!response) return null;

  const hasQuery = !!response.query;
  const hasTable = !!(response.columns && response.rows);
  const hasCharts = (response.visualizations?.length ?? 0) > 0;
  const defaultTab = hasTable ? "table" : hasQuery ? "sql" : "charts";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* sm:max-w-3xl (not max-w-3xl) and min-w-0 — see relationship-editor.tsx for
          why: DialogContent's own base class is sm:max-w-sm, and only a matching
          modifier actually overrides it; min-w-0 is needed for the table below to
          scroll internally instead of pushing past the dialog edge. */}
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Query details</DialogTitle></DialogHeader>

        <div className="min-w-0">
          {!hasQuery && !hasTable && !hasCharts ? (
            <p className="text-sm text-muted-foreground">Nothing to show for this response.</p>
          ) : (
            <Tabs defaultValue={defaultTab}>
              <TabsList>
                {hasQuery && <TabsTrigger value="sql">Generated SQL</TabsTrigger>}
                {hasTable && <TabsTrigger value="table">Table</TabsTrigger>}
                {hasCharts && (
                  <TabsTrigger value="charts">
                    Charts{response.visualizations ? ` (${response.visualizations.length})` : ""}
                  </TabsTrigger>
                )}
              </TabsList>

              {hasQuery && (
                <TabsContent value="sql" className="min-w-0 overflow-x-auto">
                  <QueryViewer query={response.query!} />
                </TabsContent>
              )}
              {hasTable && (
                <TabsContent value="table" className="min-w-0 overflow-x-auto">
                  <ResultTable columns={response.columns!} rows={response.rows!} />
                </TabsContent>
              )}
              {hasCharts && response.rows && (
                <TabsContent value="charts" className="min-w-0 overflow-x-auto">
                  <ChartCarousel visualizations={response.visualizations ?? []} rows={response.rows} />
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}