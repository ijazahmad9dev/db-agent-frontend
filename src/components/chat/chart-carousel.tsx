"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartView } from "./chart-view";
import { KpiCard } from "./kpi-card";
import type { Visualization } from "@/lib/types";

export function ChartCarousel({
  visualizations,
  rows,
}: {
  visualizations: Visualization[];
  rows: Record<string, unknown>[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0); // reset to the first suggestion whenever a new result arrives
  }, [visualizations]);

  if (visualizations.length === 0) {
    return <p className="text-sm text-muted-foreground">No charts available for the latest result.</p>;
  }

  // When every suggestion is a KPI tile, show them together in a row instead of
  // paging through them one at a time — KPIs are compact and meant to be scanned together.
  const allKpi = visualizations.every((v) => v.type === "kpi");
  if (allKpi) {
    return (
      <div className="flex flex-wrap gap-4">
        {visualizations.map((viz, i) => (
          <KpiCard key={i} viz={viz} rows={rows} />
        ))}
      </div>
    );
  }

  const current = visualizations[index];

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{current.title}</h3>
        {visualizations.length > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIndex((i) => (i - 1 + visualizations.length) % visualizations.length)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {index + 1} / {visualizations.length}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIndex((i) => (i + 1) % visualizations.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <ChartView viz={current} rows={rows} />
    </div>
  );
}