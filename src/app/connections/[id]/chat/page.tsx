"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSelectedTables } from "@/hooks/use-tables";
import { useChatSession } from "@/hooks/use-chat-session";
import { SessionSidebar } from "@/components/chat/session-sidebar";
import { ChatThread } from "@/components/chat/chat-thread";
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

  const { messages, askQuestion, isPending, latestResponse, chatError } = useChatSession(id, activeSessionId);

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

  return (
    <div className="flex gap-6">
      <SessionSidebar connectionId={id} activeSessionId={activeSessionId} onSelect={handleSelectSession} />

      <div className="flex-1 space-y-4">
        <h1 className="text-2xl font-semibold">Chat</h1>
        <ChatThread messages={messages} isPending={isPending} onAsk={askQuestion} error={chatError} />
      </div>
    </div>
  );
}