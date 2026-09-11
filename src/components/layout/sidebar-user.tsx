"use client";

import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function SidebarUser() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  if (!user) return null;

  return (
    <div className="border-t p-3">
      <div className="flex items-center gap-2">
        {user.picture_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.picture_url} alt={user.name ?? user.email} className="h-8 w-8 rounded-full" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name ?? user.email}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => logout()}>
        Sign out
      </Button>
    </div>
  );
}
