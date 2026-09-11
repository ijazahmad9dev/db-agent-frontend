"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelectedTables } from "@/hooks/use-tables";
import { useChatSession } from "@/hooks/use-chat-session";
import { ChatThread } from "@/components/chat/chat-thread";
import { ResultsPanel } from "@/components/chat/results-panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: selected, isLoading } = useSelectedTables(id);
  const hasSelection = (selected?.table_names?.length ?? 0) > 0;
  const { messages, askQuestion, isPending } = useChatSession(id);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Auto-follow the newest assistant response as new questions come in.
  // Clicking an older question in the thread still lets you inspect it —
  // the panel just snaps back to "latest" on the next new question.
  useEffect(() => {
    const lastAssistantIndex = messages.reduce<number | null>(
      (acc, m, i) => (m.role === "assistant" ? i : acc),
      null
    );
    if (lastAssistantIndex !== null) setSelectedIndex(lastAssistantIndex);
  }, [messages.length]);

  useEffect(() => {
    if (!isLoading && !hasSelection) router.replace(`/connections/${id}/tables`);
  }, [isLoading, hasSelection, id, router]);

  if (isLoading || !hasSelection) return <Skeleton className="h-96 w-full" />;

  const selectedResponse = selectedIndex !== null ? messages[selectedIndex]?.response : undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Chat</h1>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChatThread
          messages={messages}
          isPending={isPending}
          onAsk={askQuestion}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
        <ResultsPanel response={selectedResponse} />
      </div>
    </div>
  );
}