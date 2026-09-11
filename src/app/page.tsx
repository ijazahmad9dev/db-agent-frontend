"use client";

import Link from "next/link";
import { Plus, Database } from "lucide-react";
import { useConnections } from "@/hooks/use-connections";
import { useCurrentUser } from "@/hooks/use-auth";
import { ConnectionCard } from "@/components/connections/connection-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const SOURCE_TYPES = ["postgres", "mysql", "csv", "gsheets"] as const;

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const { data: connections, isLoading } = useConnections();

  const total = connections?.length ?? 0;
  const byType = (connections ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.source_type] = (acc[c.source_type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">Here&apos;s an overview of your connections.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {isLoading ? <Skeleton className="h-8 w-12" /> : total}
          </CardContent>
        </Card>
        {SOURCE_TYPES.map((type) => (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium capitalize text-muted-foreground">{type}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {isLoading ? <Skeleton className="h-8 w-12" /> : byType[type] ?? 0}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your connections</h2>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/connections">View all</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/connections/new">
              <Plus className="mr-1 h-4 w-4" />
              New connection
            </Link>
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {!isLoading && total === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
            <Database className="h-8 w-8" />
            <p>No connections yet. Create one to get started.</p>
            <Button asChild>
              <Link href="/connections/new">New connection</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {connections?.slice(0, 6).map((conn) => (
          <ConnectionCard key={conn.id} connection={conn} />
        ))}
      </div>
    </div>
  );
}
