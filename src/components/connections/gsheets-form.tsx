"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function GSheetsForm() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const [name, setName] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [needsReauth, setNeedsReauth] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.createGSheetsConnection(name, sheetUrl),
    onSuccess: (conn) => router.push(`/connections/${conn.id}/tables`),
    onError: (err) => {
      if (err instanceof ApiError && err.status === 428) setNeedsReauth(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNeedsReauth(false);
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="gsheets-name">Connection name</Label>
        <Input id="gsheets-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gsheets-url">Google Sheet link</Label>
        <Input
          id="gsheets-url"
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          required
        />
        <p className="text-xs text-muted-foreground">
          {user?.sheets_connected
            ? "Public and private sheets both work — private sheets use your connected Google account automatically."
            : "Public sheets work immediately. Private sheets need Sheets access, granted when you sign in."}
        </p>
      </div>

      {mutation.error && !needsReauth && (
        <Alert variant="destructive"><AlertDescription>{mutation.error.message}</AlertDescription></Alert>
      )}

      {needsReauth && (
        <Alert>
          <AlertDescription className="space-y-2">
            <p>Your session doesn&apos;t have Sheets access yet — sign out and sign back in to grant it.</p>
            <Button type="button" variant="secondary" size="sm" onClick={() => logout()}>Sign out</Button>
          </AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={mutation.isPending || !name || !sheetUrl}>
        {mutation.isPending ? "Connecting..." : "Create connection"}
      </Button>
    </form>
  );
}