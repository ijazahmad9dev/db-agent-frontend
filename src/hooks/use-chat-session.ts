"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ChatHistoryMessage } from "@/lib/types";

export function useChatSession(connectionId: string, sessionId: string | null) {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ["chat-history", sessionId],
    queryFn: () => api.getChatSessionHistory(sessionId!),
    enabled: !!sessionId,
  });

  const chatMutation = useMutation({
    mutationFn: (question: string) =>
      api.chat({ connection_id: connectionId, session_id: sessionId ?? undefined, question }),
    onSuccess: (response) => {
      // A brand-new session (no sessionId passed in) gets created server-side — refresh
      // both the session list (new entry, new title) and the sidebar ordering.
      queryClient.invalidateQueries({ queryKey: ["chat-sessions", connectionId] });
      queryClient.invalidateQueries({ queryKey: ["chat-history", response.session_id] });
    },
  });

  const messages: ChatHistoryMessage[] = historyQuery.data ?? [];
  const latestAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const optimisticLatest = chatMutation.data;

  return {
    messages,
    askQuestion: (question: string) => chatMutation.mutate(question),
    isPending: chatMutation.isPending,
    isLoadingHistory: historyQuery.isLoading,
    // Prefer the just-returned response (instant) over refetched history (one round-trip behind)
    latestResponse: optimisticLatest ?? latestAssistant?.response,
  };
}