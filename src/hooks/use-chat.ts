import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ChatResponse } from "@/lib/types";

export interface ChatMessage {
  role: "user" | "assistant";
  question?: string;
  response?: ChatResponse;
}

export function useChat(connectionId: string) {
  return useMutation({
    mutationFn: (question: string) => api.chat({ connection_id: connectionId, question }),
  });
}