import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Visualization } from "@/lib/types";

function formatKpiValue(raw: unknown): string {
  if (raw === null || raw === undefined || raw === "") return "—";

  const asNumber = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isNaN(asNumber)) {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(asNumber);
  }
  return String(raw);
}

export function KpiCard({
  viz,
  rows,
}: {
  viz: Visualization;
  rows: Record<string, unknown>[];
}) {
  const raw = viz.value ? rows[0]?.[viz.value] : undefined;

  return (
    <Card className="min-w-[180px] flex-1">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {viz.label ?? viz.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-3xl font-semibold tracking-tight">
          {formatKpiValue(raw)}
        </span>
      </CardContent>
    </Card>
  );
}