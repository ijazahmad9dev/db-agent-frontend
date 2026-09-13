"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChatHistoryMessage } from "@/lib/types";

export function ChatThread({
  messages, isPending, onAsk, error,
}: {
  messages: ChatHistoryMessage[];
  isPending: boolean;
  onAsk: (question: string) => void;
  error?: string | null;
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
            <div key={i} className="max-w-2xl">
              <p className={msg.response?.error ? "text-destructive" : ""}>{msg.response?.error ?? msg.response?.answer}</p>
            </div>
          )
        )}
        {isPending && <p className="text-sm text-muted-foreground">Thinking...</p>}
        {/* Without this, a failed request just silently reverted with no feedback
            at all — from the user's point of view the question simply vanished. */}
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
    </div>
  );
}