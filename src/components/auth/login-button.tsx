"use client";

import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export function LoginButton() {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  if (isLoading) return null;

  if (!user) {
    return (
      <Button onClick={() => { window.location.href = `${API_URL}/auth/google/login`; }}>
        Sign in with Google
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {user.picture_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.picture_url} alt={user.name ?? user.email} className="h-8 w-8 rounded-full" />
      )}
      <span className="text-sm">{user.name ?? user.email}</span>
      <Button variant="outline" size="sm" onClick={() => logout()}>Sign out</Button>
    </div>
  );
}