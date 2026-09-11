"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useChatSessions(connectionId: string) {
  return useQuery({
    queryKey: ["chat-sessions", connectionId],
    queryFn: () => api.listChatSessions(connectionId),
  });
}

export function useCreateChatSession(connectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.createChatSession(connectionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat-sessions", connectionId] }),
  });
}

export function useDeleteChatSession(connectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => api.deleteChatSession(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat-sessions", connectionId] }),
  });
}

export function useRenameChatSession(connectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, title }: { sessionId: string; title: string }) =>
      api.renameChatSession(sessionId, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat-sessions", connectionId] }),
  });
}