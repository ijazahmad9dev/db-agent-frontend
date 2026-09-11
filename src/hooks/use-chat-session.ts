"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useChatStore } from "@/stores/chat-store";
import type { ChatMessage } from "@/stores/chat-store";

const EMPTY_MESSAGES: ChatMessage[] = []; // stable reference — never allocate a new [] inside the selector

export function useChatSession(connectionId: string) {
  const messages = useChatStore((s) => s.messagesByConnection[connectionId] ?? EMPTY_MESSAGES);
  const addMessage = useChatStore((s) => s.addMessage);

  const chatMutation = useMutation({
    mutationFn: (question: string) => api.chat({ connection_id: connectionId, question }),
  });

  const askQuestion = (question: string) => {
    if (!question.trim()) return;
    addMessage(connectionId, { role: "user", question });

    chatMutation.mutate(question, {
      onSuccess: (response) => addMessage(connectionId, { role: "assistant", response }),
      onError: (err) =>
        addMessage(connectionId, {
          role: "assistant",
          response: {
            answer: null, query: null, columns: null, rows: null, metadata: null, visualizations: [],
            error: `Request failed: ${err.message}`,
          },
        }),
    });
  };

  const latestAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");

  return { messages, askQuestion, isPending: chatMutation.isPending, latestResponse: latestAssistantMessage?.response };
}