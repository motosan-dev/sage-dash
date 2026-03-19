import { useCallback, useEffect, useRef, useState } from "react";
import type { Message } from "@motosan/sage-ui";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ClientChatTabProps {
  messages: Message[];
  isHumanMode: boolean;
  onSendReply: (text: string) => Promise<void>;
  isSending: boolean;
  onHandoffToHuman: () => Promise<void>;
  onHandoffToAi: () => Promise<void>;
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function roleLabel(role: Message["role"]): string {
  switch (role) {
    case "user":
      return "Client";
    case "assistant":
      return "AI";
    case "human_agent":
      return "Agent";
    default:
      return role;
  }
}

function roleBgClass(role: Message["role"]): string {
  switch (role) {
    case "user":
      return "bg-muted";
    case "assistant":
      return "bg-blue-50 dark:bg-blue-950";
    case "human_agent":
      return "bg-green-50 dark:bg-green-950";
    default:
      return "bg-muted";
  }
}

export function ClientChatTab({
  messages,
  isHumanMode,
  onSendReply,
  isSending,
  onHandoffToHuman,
  onHandoffToAi,
}: ClientChatTabProps) {
  const [replyText, setReplyText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = replyText.trim();
    if (!text) return;
    await onSendReply(text);
    setReplyText("");
  }, [replyText, onSendReply]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="flex h-[600px] flex-col space-y-4">
      {/* Handoff control bar */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${isHumanMode ? "bg-green-500" : "bg-blue-500"}`}
          />
          <span className="text-sm font-medium">
            {isHumanMode ? "Human mode" : "AI mode"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isHumanMode ? (
            <Button variant="outline" size="sm" onClick={onHandoffToAi}>
              交回 AI
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={onHandoffToHuman}>
              接管
            </Button>
          )}
          <Button variant="ghost" size="sm" disabled title="Coming soon">
            AI 建議回覆
          </Button>
        </div>
      </div>

      {/* Message list */}
      <ScrollArea className="flex-1 rounded-lg border" ref={scrollRef}>
        <div className="space-y-3 p-4">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No messages yet.
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg p-3 ${roleBgClass(msg.role)}`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {roleLabel(msg.role)}
                </span>
                <time
                  className="text-xs text-muted-foreground"
                  dateTime={msg.timestamp}
                >
                  {formatTimestamp(msg.timestamp)}
                </time>
              </div>
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Reply input */}
      <div className="flex gap-2">
        <Textarea
          placeholder={
            isHumanMode
              ? "Type a reply..."
              : "Switch to human mode to reply"
          }
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isHumanMode}
          className="min-h-[60px] resize-none"
          aria-label="Reply message"
        />
        <Button
          onClick={handleSend}
          disabled={!isHumanMode || isSending || !replyText.trim()}
          className="self-end"
        >
          {isSending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
