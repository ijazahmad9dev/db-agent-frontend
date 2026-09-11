"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelectedTables } from "@/hooks/use-tables";
import { useChatSession } from "@/hooks/use-chat-session";
import { ChatThread } from "@/components/chat/chat-thread";
import { QueryViewer } from "@/components/chat/query-viewer";
import { ResultTable } from "@/components/chat/result-table";
import { ChartCarousel } from "@/components/chat/chart-carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: selected, isLoading } = useSelectedTables(id);
  const hasSelection = (selected?.table_names?.length ?? 0) > 0;
  const { messages, askQuestion, isPending, latestResponse } = useChatSession(id);

  useEffect(() => {
    if (!isLoading && !hasSelection) router.replace(`/connections/${id}/tables`);
  }, [isLoading, hasSelection, id, router]);

  if (isLoading || !hasSelection) return <Skeleton className="h-96 w-full" />;

  const visualizations = latestResponse?.visualizations ?? [];

  return (
    <div className="space-y-4">
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
          {latestResponse?.query ? (
            <QueryViewer query={latestResponse.query} />
          ) : (
            <p className="text-sm text-muted-foreground">No query generated yet — ask a question first.</p>
          )}
        </TabsContent>

        <TabsContent value="table">
          {latestResponse?.columns && latestResponse?.rows ? (
            <ResultTable columns={latestResponse.columns} rows={latestResponse.rows} />
          ) : (
            <p className="text-sm text-muted-foreground">No results yet — ask a question first.</p>
          )}
        </TabsContent>

        <TabsContent value="charts">
          {latestResponse?.rows ? (
            <ChartCarousel visualizations={visualizations} rows={latestResponse.rows} />
          ) : (
            <p className="text-sm text-muted-foreground">No charts available for the latest result.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
