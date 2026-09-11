export function QueryViewer({ query }: { query: string }) {
  return (
    <details className="rounded-md border bg-muted/40">
      <summary className="cursor-pointer px-3 py-2 text-sm font-medium">Generated SQL</summary>
      <pre className="overflow-x-auto px-3 pb-3 text-xs">{query}</pre>
    </details>
  );
}