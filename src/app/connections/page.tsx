"use client";

import Link from "next/link";
import { useConnections } from "@/hooks/use-connections";
import { ConnectionCard } from "@/components/connections/connection-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ConnectionsPage() {
  const { data: connections, isLoading, isError } = useConnections();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Connections</h1>
        <Button asChild>
          <Link href="/connections/new">New connection</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load connections.</AlertDescription>
        </Alert>
      )}

      {connections?.length === 0 && (
        <p className="text-muted-foreground">No connections yet — create one to get started.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {connections?.map((conn) => (
          <ConnectionCard key={conn.id} connection={conn} />
        ))}
      </div>
    </div>
  );
}
