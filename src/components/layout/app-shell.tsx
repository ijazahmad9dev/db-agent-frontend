"use client";

import { useCurrentUser } from "@/hooks/use-auth";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-semibold">DB Agent</h1>
          <p className="text-muted-foreground">Sign in with Google to manage your connections.</p>
          <Button
            className="w-full"
            onClick={() => {
              window.location.href = `${API_URL}/auth/google/login`;
            }}
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="min-h-screen flex-1 overflow-y-auto px-8 py-6">{children}</main>
    </div>
  );
}
