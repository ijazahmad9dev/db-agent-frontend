"use client";

import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  useChatSessions, useCreateChatSession, useDeleteChatSession,
} from "@/hooks/use-chat-sessions";

export function SessionSidebar({
  connectionId, activeSessionId, onSelect,
}: {
  connectionId: string;
  activeSessionId: string | null;
  onSelect: (sessionId: string | null) => void;
}) {
  const { data: sessions, isLoading } = useChatSessions(connectionId);
  const createMutation = useCreateChatSession(connectionId);
  const deleteMutation = useDeleteChatSession(connectionId);

  const handleNewChat = () => onSelect(null); // null = "unsaved new chat" — session is created lazily on first question

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    deleteMutation.mutate(sessionId, {
      onSuccess: () => {
        if (activeSessionId === sessionId) onSelect(null);
      },
    });
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] w-64 shrink-0 flex-col border-r">
      <div className="p-2">
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleNewChat}>
          <Plus className="mr-2 h-4 w-4" />
          New chat
        </Button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2">
        {isLoading && <p className="px-2 text-xs text-muted-foreground">Loading...</p>}
        {sessions?.length === 0 && <p className="px-2 text-xs text-muted-foreground">No chats yet.</p>}
        {sessions?.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelect(session.id)}
            className={cn(
              "group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
              activeSessionId === session.id ? "bg-muted font-medium" : "hover:bg-muted/50 text-muted-foreground"
            )}
          >
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{session.title ?? "New chat"}</span>
            <span
              role="button"
              onClick={(e) => handleDelete(e, session.id)}
              className="opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5 hover:text-destructive" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}