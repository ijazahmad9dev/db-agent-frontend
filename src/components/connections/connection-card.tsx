"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useTestConnection } from "@/hooks/use-connection-test";
import { useDeleteConnection } from "@/hooks/use-connections";
import type { Connection } from "@/lib/types";

type Status = "idle" | "testing" | "healthy" | "unhealthy" | "error";

export function ConnectionCard({ connection }: { connection: Connection }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const testMutation = useTestConnection();
  const deleteMutation = useDeleteConnection();

  const handleTest = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus("testing");
    testMutation.mutate(connection.id, {
      onSuccess: (result) => { setStatus(result.success ? "healthy" : "unhealthy"); setMessage(result.message); },
      onError: (err) => { setStatus("error"); setMessage(err.message); },
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(connection.id, { onSuccess: () => setConfirmOpen(false) });
  };

  const statusBadge: Record<Status, React.ReactNode> = {
    idle: null,
    testing: <Badge variant="secondary">Testing...</Badge>,
    healthy: <Badge className="bg-green-600 hover:bg-green-600">Healthy</Badge>,
    unhealthy: <Badge variant="destructive">Unhealthy</Badge>,
    error: <Badge variant="destructive">Error</Badge>,
  };

  return (
    <>
      <Link href={`/connections/${connection.id}/tables`}>
        <Card className="transition hover:border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              {connection.name}
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{connection.source_type}</Badge>
                <Button variant="ghost" size="icon-sm" onClick={handleDeleteClick}>
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>{connection.is_active ? "Active" : "Inactive"}</span>
              <Button size="sm" variant="outline" onClick={handleTest} disabled={status === "testing"}>
                {status === "testing" ? "Testing..." : "Test"}
              </Button>
            </div>
            {statusBadge[status]}
            {message && <p className="text-xs">{message}</p>}
          </CardContent>
        </Card>
      </Link>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader><DialogTitle>Delete &quot;{connection.name}&quot;?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            This permanently removes the connection, its uploaded files (if any), semantic layer, and indexed data. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}