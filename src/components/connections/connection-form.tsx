"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateConnection } from "@/hooks/use-connections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DEFAULT_PORTS: Record<string, string> = { postgres: "5432", mysql: "3306" };

export function ConnectionForm() {
  const router = useRouter();
  const [sourceType, setSourceType] = useState<"postgres" | "mysql">("postgres");
  const [name, setName] = useState("");
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState(DEFAULT_PORTS.postgres);
  const [database, setDatabase] = useState("");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, isPending, error } = useCreateConnection();

  const handleSourceTypeChange = (value: "postgres" | "mysql" | null) => {
    if (!value) return;
    setSourceType(value);
    setPort(DEFAULT_PORTS[value]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      {
        name,
        source_type: sourceType,
        config: { host, port: Number(port), database, user, password },
      },
      { onSuccess: (conn) => router.push(`/connections/${conn.id}/tables`) }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Database type</Label>
        <Select value={sourceType} onValueChange={handleSourceTypeChange}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="postgres">PostgreSQL</SelectItem>
            <SelectItem value="mysql">MySQL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="conn-name">Connection name</Label>
        <Input id="conn-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="host">Host</Label>
          <Input id="host" value={host} onChange={(e) => setHost(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input id="port" value={port} onChange={(e) => setPort(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="database">Database name</Label>
        <Input id="database" value={database} onChange={(e) => setDatabase(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="user">User</Label>
          <Input id="user" value={user} onChange={(e) => setUser(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Testing & connecting..." : "Create connection"}
      </Button>
    </form>
  );
}