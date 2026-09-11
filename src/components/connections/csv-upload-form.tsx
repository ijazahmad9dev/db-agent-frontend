"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateCSVConnection } from "@/hooks/use-connections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CSVUploadForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const { mutate, isPending, error } = useCreateCSVConnection();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || files.length === 0) return;
    mutate(
      { name, files },
      { onSuccess: (conn) => router.push(`/connections/${conn.id}/tables`) }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="csv-name">Connection name</Label>
        <Input id="csv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. sales-data" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="csv-files">CSV file(s)</Label>
        <Input
          id="csv-files"
          type="file"
          accept=".csv"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          required
        />
        {files.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {files.length} file{files.length > 1 ? "s" : ""} selected: {files.map((f) => f.name).join(", ")}
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isPending || !name || files.length === 0}>
        {isPending ? "Uploading..." : "Create connection"}
      </Button>
    </form>
  );
}