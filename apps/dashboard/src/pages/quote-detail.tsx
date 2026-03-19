import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSageApi, useQuote } from "@motosan/sage-ui";
import type { QuoteItem } from "@motosan/sage-ui";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QuoteBuilder } from "@/components/quote-builder";
import { QuoteStatusBadge } from "@/components/quote-status-badge";

// ---------------------------------------------------------------------------
// QuoteDetailPage
// ---------------------------------------------------------------------------

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const api = useSageApi();

  const { quote, isLoading, updateQuote, isUpdating, sendToLine, isSending } =
    useQuote(api, id ?? "");

  // Local state for editing
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [note, setNote] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  // Sync local state from fetched quote
  useEffect(() => {
    if (quote) {
      setItems(quote.items);
      setNote(quote.note);
      setIsDirty(false);
    }
  }, [quote]);

  const handleItemsChange = useCallback((newItems: QuoteItem[]) => {
    setItems(newItems);
    setIsDirty(true);
  }, []);

  const handleNoteChange = useCallback((newNote: string) => {
    setNote(newNote);
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await updateQuote({ items, note });
      setIsDirty(false);
      toast.success("報價已儲存");
    } catch (error) {
      toast.error("儲存報價失敗", {
        description: error instanceof Error ? error.message : "請稍後再試",
      });
    }
  }, [items, note, updateQuote]);

  const handleSendToLine = useCallback(async () => {
    // Save first if dirty
    if (isDirty) {
      try {
        await updateQuote({ items, note });
        setIsDirty(false);
      } catch (error) {
        toast.error("儲存報價失敗", {
          description: error instanceof Error ? error.message : "請稍後再試",
        });
        return;
      }
    }
    try {
      await sendToLine();
      toast.success("報價已傳送至 LINE");
    } catch (error) {
      toast.error("傳送至 LINE 失敗", {
        description: error instanceof Error ? error.message : "請稍後再試",
      });
    }
  }, [isDirty, items, note, updateQuote, sendToLine]);

  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading quote details">
        <div className="h-12 animate-pulse rounded-lg bg-muted" />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Quote not found.</p>
        <Button
          variant="link"
          onClick={() => navigate("/quotes")}
          className="mt-2"
        >
          Back to Quotes
        </Button>
      </div>
    );
  }

  const isReadOnly = quote.status === "accepted" || quote.status === "expired";

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/quotes")}
        className="mb-2"
      >
        &larr; Back to Quotes
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Quote for {quote.client_name}
            </h1>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Created{" "}
            {new Date(quote.created_at).toLocaleDateString("zh-TW", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {quote.updated_at !== quote.created_at && (
              <>
                {" "}
                &middot; Updated{" "}
                {new Date(quote.updated_at).toLocaleDateString("zh-TW", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </>
            )}
          </p>
        </div>

        {/* Save button */}
        {!isReadOnly && (
          <Button onClick={handleSave} disabled={!isDirty || isUpdating}>
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        )}
      </div>

      <Separator />

      {/* Quote builder */}
      <QuoteBuilder
        items={items}
        note={note}
        onItemsChange={handleItemsChange}
        onNoteChange={handleNoteChange}
        onSendToLine={handleSendToLine}
        isSending={isSending}
        readOnly={isReadOnly}
      />
    </div>
  );
}
