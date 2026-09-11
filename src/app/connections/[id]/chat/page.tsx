"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSelectedTables } from "@/hooks/use-tables";
import { useChatSession } from "@/hooks/use-chat-session";
import { SessionSidebar } from "@/components/chat/session-sidebar";
import { ChatThread } from "@/components/chat/chat-thread";
import { QueryViewer } from "@/components/chat/query-viewer";
import { ResultTable } from "@/components/chat/result-table";
import { ChartCarousel } from "@/components/chat/chart-carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: selected, isLoading } = useSelectedTables(id);
  const hasSelection = (selected?.table_names?.length ?? 0) > 0;

  const [activeSessionId, setActiveSessionId] = useState<string | null>(searchParams.get("session"));

  const handleSelectSession = (sessionId: string | null) => {
    setActiveSessionId(sessionId);
    const params = new URLSearchParams(searchParams.toString());
    if (sessionId) params.set("session", sessionId); else params.delete("session");
    router.replace(`/connections/${id}/chat?${params.toString()}`);
  };

  const { messages, askQuestion, isPending, latestResponse } = useChatSession(id, activeSessionId);

  // When a brand-new chat's first question comes back with a real session_id, adopt
  // it as the active session — otherwise the URL/sidebar never reflect the new chat.
  useEffect(() => {
    if (latestResponse?.session_id && latestResponse.session_id !== activeSessionId) {
      handleSelectSession(latestResponse.session_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestResponse?.session_id]);

  useEffect(() => {
    if (!isLoading && !hasSelection) router.replace(`/connections/${id}/tables`);
  }, [isLoading, hasSelection, id, router]);

  if (isLoading || !hasSelection) return <Skeleton className="h-96 w-full" />;

  const visualizations = latestResponse?.visualizations ?? [];

  return (
    <div className="flex gap-6">
      <SessionSidebar connectionId={id} activeSessionId={activeSessionId} onSelect={handleSelectSession} />

      <div className="flex-1 space-y-4">
        <h1 className="text-2xl font-semibold">Chat</h1>

        <Tabs defaultValue="chat">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="sql">Generated SQL</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="charts">
              Charts{visualizations.length > 0 ? ` (${visualizations.length})` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <ChatThread messages={messages} isPending={isPending} onAsk={askQuestion} />
          </TabsContent>
          <TabsContent value="sql">
            {latestResponse?.query ? <QueryViewer query={latestResponse.query} /> : <p className="text-sm text-muted-foreground">No query generated yet.</p>}
          </TabsContent>
          <TabsContent value="table">
            {latestResponse?.columns && latestResponse?.rows ? <ResultTable columns={latestResponse.columns} rows={latestResponse.rows} /> : <p className="text-sm text-muted-foreground">No results yet.</p>}
          </TabsContent>
          <TabsContent value="charts">
            {latestResponse?.rows ? <ChartCarousel visualizations={visualizations} rows={latestResponse.rows} /> : <p className="text-sm text-muted-foreground">No charts available.</p>}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}