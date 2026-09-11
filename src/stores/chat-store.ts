import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ChatResponse } from "@/lib/types";

export interface ChatMessage {
  role: "user" | "assistant";
  question?: string;
  response?: ChatResponse;
}

interface ChatStoreState {
  messagesByConnection: Record<string, ChatMessage[]>;
  addMessage: (connectionId: string, message: ChatMessage) => void;
  clearConnection: (connectionId: string) => void;
}

// Session-scoped only (sessionStorage): survives navigating between pages and a
// page refresh in the same tab, but clears when the tab closes. Real cross-device,
// cross-session history comes with the backend LangGraph checkpointer (next phase) --
// this store is intentionally kept behind the same useChatSession() hook interface
// so swapping to API-backed history later doesn't require touching any page/component.
export const useChatStore = create<ChatStoreState>()(
  persist(
    (set) => ({
      messagesByConnection: {},
      addMessage: (connectionId, message) =>
        set((state) => ({
          messagesByConnection: {
            ...state.messagesByConnection,
            [connectionId]: [...(state.messagesByConnection[connectionId] ?? []), message],
          },
        })),
      clearConnection: (connectionId) =>
        set((state) => {
          const next = { ...state.messagesByConnection };
          delete next[connectionId];
          return { messagesByConnection: next };
        }),
    }),
    {
      name: "db-agent-chat-sessions",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);