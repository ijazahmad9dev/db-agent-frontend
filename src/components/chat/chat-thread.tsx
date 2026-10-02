"use client";

import { useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatResultDialog } from "./chat-result-dialog";
import type { ChatHistoryMessage, ChatResponse } from "@/lib/types";

function hasDisplayableResult(response: ChatResponse | null): boolean {
  if (!response) return false;
  return !!response.query || !!(response.columns && response.rows) || (response.visualizations?.length ?? 0) > 0;
}

export function ChatThread({
  messages, isPending, onAsk, error,
}: {
  messages: ChatHistoryMessage[];
  isPending: boolean;
  onAsk: (question: string) => void;
  error?: string | null;
}) {
  const [question, setQuestion] = useState("");
  const [selectedResponse, setSelectedResponse] = useState<ChatResponse | null>(null);

  const handleAsk = () => {
    if (!question.trim()) return;
    onAsk(question);
    setQuestion("");
  };

  return (
    <div className="flex h-[calc(100vh-14rem)] flex-col gap-4">
      <div className="flex-1 space-y-3 overflow-y-auto rounded-md border p-4">
        {messages.length === 0 && <p className="text-sm text-muted-foreground">Ask a question about your selected tables.</p>}
        {messages.map((msg, i) => {
          if (msg.role === "user") {
            return (
              <div key={i} className="ml-auto max-w-lg rounded-lg bg-primary px-4 py-2 text-primary-foreground">
                {msg.question}
              </div>
            );
          }

          const clickable = hasDisplayableResult(msg.response);
          return (
            <button
              key={i}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && setSelectedResponse(msg.response)}
              className={cn(
                "block max-w-2xl rounded-md p-2 text-left",
                clickable && "transition-colors hover:bg-muted/50 cursor-pointer"
              )}
            >
              <p className={msg.response?.error ? "text-destructive" : ""}>{msg.response?.error ?? msg.response?.answer}</p>
              {clickable && (
                <span className="mt-1 block text-xs text-muted-foreground">Click to view SQL, table & charts</span>
              )}
            </button>
          );
        })}
        {isPending && <p className="text-sm text-muted-foreground">Thinking...</p>}
        {!isPending && error && <p className="max-w-2xl text-sm text-destructive">{error}</p>}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
          placeholder="Ask a question about your data..."
          rows={2}
        />
        <Button onClick={handleAsk} disabled={isPending || !question.trim()}>Ask</Button>
      </div>

      <ChatResultDialog
        response={selectedResponse}
        open={selectedResponse !== null}
        onOpenChange={(open) => !open && setSelectedResponse(null)}
      />
    </div>
  );
}