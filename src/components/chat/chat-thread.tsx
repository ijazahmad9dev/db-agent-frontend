"use client";

import { useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessage } from "@/stores/chat-store";

export function ChatThread({
  messages,
  isPending,
  onAsk,
  selectedIndex,
  onSelect,
}: {
  messages: ChatMessage[];
  isPending: boolean;
  onAsk: (question: string) => void;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}) {
  const [question, setQuestion] = useState("");

  const handleAsk = () => {
    if (!question.trim()) return;
    onAsk(question);
    setQuestion("");
  };

  return (
    <div className="flex h-[calc(100vh-14rem)] flex-col gap-4">
      <div className="flex-1 space-y-3 overflow-y-auto rounded-md border p-4">
        {messages.length === 0 && <p className="text-sm text-muted-foreground">Ask a question about your selected tables.</p>}
        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="ml-auto max-w-lg rounded-lg bg-primary px-4 py-2 text-primary-foreground">{msg.question}</div>
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                "block w-full max-w-2xl rounded-md p-2 text-left transition-colors hover:bg-muted/50",
                selectedIndex === i && "bg-muted ring-1 ring-primary/40"
              )}
            >
              <p className={msg.response?.error ? "text-destructive" : ""}>{msg.response?.error ?? msg.response?.answer}</p>
              {msg.response && (msg.response.query || msg.response.columns) && (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {selectedIndex === i ? "Showing in panel →" : "Click to view SQL, table & charts"}
                </span>
              )}
            </button>
          )
        )}
        {isPending && <p className="text-sm text-muted-foreground">Thinking...</p>}
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
    </div>
  );
}