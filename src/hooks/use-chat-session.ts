"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
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

  const historyMessages: ChatHistoryMessage[] = historyQuery.data ?? [];

  // The real history entry for the in-flight question only exists once the round
  // trip completes AND history refetches — without this, the user's own question
  // would be invisible the entire time the backend is working, which is exactly
  // the "question disappears" bug: only "Thinking..." showed, with nothing above it.
  const pendingQuestion = chatMutation.isPending ? chatMutation.variables : undefined;
  const messages: ChatHistoryMessage[] = pendingQuestion
    ? [
        ...historyMessages,
        {
          role: "user",
          question: pendingQuestion,
          response: null,
          created_at: new Date().toISOString(),
        },
      ]
    : historyMessages;

  const latestAssistant = [...historyMessages].reverse().find((m) => m.role === "assistant");
  const optimisticLatest = chatMutation.data;

  // Surface a readable message on failure instead of the request silently
  // reverting with no feedback at all — that silence was the other half of why
  // it looked like the question just "disappeared."
  const chatError =
    chatMutation.isError
      ? chatMutation.error instanceof ApiError
        ? chatMutation.error.message
        : "Something went wrong sending that question. Please try again."
      : null;

  return {
    messages,
    askQuestion: (question: string) => chatMutation.mutate(question),
    isPending: chatMutation.isPending,
    isLoadingHistory: historyQuery.isLoading,
    chatError,
    // Prefer the just-returned response (instant) over refetched history (one round-trip behind)
    latestResponse: optimisticLatest ?? latestAssistant?.response,
  };
}