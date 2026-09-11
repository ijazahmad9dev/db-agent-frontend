"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryViewer } from "./query-viewer";
import { ResultTable } from "./result-table";
import { ChartCarousel } from "./chart-carousel";
import type { ChatResponse } from "@/lib/types";

export function ResultsPanel({ response }: { response?: ChatResponse }) {
  if (!response) {
    return (
      <div className="flex h-[calc(100vh-14rem)] items-center justify-center rounded-md border text-sm text-muted-foreground">
        Ask a question to see the generated SQL, table, and charts here.
      </div>
    );
  }

  const hasQuery = !!response.query;
  const hasTable = !!(response.columns && response.rows);
  const hasCharts = (response.visualizations?.length ?? 0) > 0;

  if (!hasQuery && !hasTable && !hasCharts) {
    return (
      <div className="flex h-[calc(100vh-14rem)] items-center justify-center rounded-md border text-sm text-muted-foreground">
        {response.error ? "This question couldn't be answered — no query or results to show." : "No results for this question."}
      </div>
    );
  }

  const defaultTab = hasTable ? "table" : hasQuery ? "sql" : "charts";

  return (
    // key forces a remount when switching between messages, so the default tab
    // (e.g. "table") is re-applied instead of sticking to whatever tab was open before.
    <Tabs key={response.query ?? response.answer ?? "result"} defaultValue={defaultTab} className="h-[calc(100vh-14rem)] rounded-md border p-3">
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
        <TabsContent value="sql" className="overflow-auto">
          <QueryViewer query={response.query!} />
        </TabsContent>
      )}

      {hasTable && (
        <TabsContent value="table" className="overflow-auto">
          <ResultTable columns={response.columns!} rows={response.rows!} />
        </TabsContent>
      )}

      {hasCharts && response.rows && (
        <TabsContent value="charts" className="overflow-auto">
          <ChartCarousel visualizations={response.visualizations ?? []} rows={response.rows} />
        </TabsContent>
      )}
    </Tabs>
  );
}