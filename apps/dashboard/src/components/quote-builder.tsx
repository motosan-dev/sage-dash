import { useCallback, useMemo } from "react";
import type { QuoteItem } from "@motosan/sage-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = [
  "諮詢服務",
  "設計費用",
  "系統開發",
  "維護服務",
  "硬體設備",
  "其他",
] as const;

const CURRENCIES = ["TWD", "USD", "JPY", "EUR"] as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface QuoteBuilderProps {
  items: QuoteItem[];
  note: string;
  onItemsChange: (items: QuoteItem[]) => void;
  onNoteChange: (note: string) => void;
  onSendToLine: () => void;
  isSending: boolean;
  readOnly?: boolean;
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const twdFormatter = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatTWD(amount: number): string {
  return twdFormatter.format(amount);
}

// ---------------------------------------------------------------------------
// QuoteBuilder
// ---------------------------------------------------------------------------

export function QuoteBuilder({
  items,
  note,
  onItemsChange,
  onNoteChange,
  onSendToLine,
  isSending,
  readOnly = false,
}: QuoteBuilderProps) {
  const handleAddItem = useCallback(() => {
    onItemsChange([
      ...items,
      { category: CATEGORIES[0], description: "", amount: 0, currency: "TWD" },
    ]);
  }, [items, onItemsChange]);

  const handleRemoveItem = useCallback(
    (index: number) => {
      onItemsChange(items.filter((_, i) => i !== index));
    },
    [items, onItemsChange],
  );

  const handleItemChange = useCallback(
    (index: number, field: keyof QuoteItem, value: string | number) => {
      const updated = items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      );
      onItemsChange(updated);
    },
    [items, onItemsChange],
  );

  // Group items by category for subtotals (converted to TWD)
  const categorySubtotals = useMemo(() => {
    const groups: Record<string, number> = {};
    for (const item of items) {
      const cat = item.category || "Uncategorized";
      const twdAmount =
        item.currency === "TWD"
          ? (item.amount || 0)
          : (item.converted ?? item.amount ?? 0);
      groups[cat] = (groups[cat] ?? 0) + twdAmount;
    }
    return groups;
  }, [items]);

  // Grand total (assuming TWD for simplicity; items in other currencies
  // would use converted field if available)
  const grandTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.currency === "TWD") {
        return sum + (item.amount || 0);
      }
      // Use converted value if available, otherwise use raw amount
      return sum + (item.converted ?? item.amount ?? 0);
    }, 0);
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Items list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Items</Label>
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
            >
              + Add item
            </Button>
          )}
        </div>

        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No items yet. Click &quot;+ Add item&quot; to start building the
            quote.
          </p>
        )}

        {items.map((item, index) => (
          <Card key={index} className="p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_2fr_1fr_100px_auto]">
              {/* Category */}
              <div className="space-y-1">
                <Label
                  htmlFor={`item-category-${index}`}
                  className="text-xs text-muted-foreground"
                >
                  Category
                </Label>
                <Select
                  value={item.category}
                  onValueChange={(v) => handleItemChange(index, "category", v)}
                  disabled={readOnly}
                >
                  <SelectTrigger
                    id={`item-category-${index}`}
                    className="h-9"
                    aria-label={`Category for item ${index + 1}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label
                  htmlFor={`item-desc-${index}`}
                  className="text-xs text-muted-foreground"
                >
                  Description
                </Label>
                <Input
                  id={`item-desc-${index}`}
                  className="h-9"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                  placeholder="Service description"
                  readOnly={readOnly}
                  aria-label={`Description for item ${index + 1}`}
                />
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <Label
                  htmlFor={`item-amount-${index}`}
                  className="text-xs text-muted-foreground"
                >
                  Amount
                </Label>
                <Input
                  id={`item-amount-${index}`}
                  className="h-9"
                  type="number"
                  min={0}
                  value={item.amount || ""}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "amount",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  readOnly={readOnly}
                  aria-label={`Amount for item ${index + 1}`}
                />
              </div>

              {/* Currency */}
              <div className="space-y-1">
                <Label
                  htmlFor={`item-currency-${index}`}
                  className="text-xs text-muted-foreground"
                >
                  Currency
                </Label>
                <Select
                  value={item.currency}
                  onValueChange={(v) =>
                    handleItemChange(index, "currency", v)
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger
                    id={`item-currency-${index}`}
                    className="h-9"
                    aria-label={`Currency for item ${index + 1}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((cur) => (
                      <SelectItem key={cur} value={cur}>
                        {cur}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Remove button */}
              {!readOnly && (
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveItem(index)}
                    aria-label={`Remove item ${index + 1}`}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {/* Show converted amount if different currency */}
            {item.currency !== "TWD" && item.converted != null && (
              <p className="mt-2 text-xs text-muted-foreground">
                Exchange rate applied: {formatTWD(item.converted)}
              </p>
            )}
          </Card>
        ))}
      </div>

      <Separator />

      {/* Category subtotals */}
      {Object.keys(categorySubtotals).length > 0 && (
        <div className="space-y-2">
          <Label className="text-base font-semibold">Category subtotals</Label>
          <div className="space-y-1">
            {Object.entries(categorySubtotals).map(([category, subtotal]) => (
              <div
                key={category}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{category}</span>
                <span className="font-medium">{formatTWD(subtotal)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grand total */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
        <span className="text-lg font-semibold">Total (TWD)</span>
        <span className="text-lg font-bold">{formatTWD(grandTotal)}</span>
      </div>

      <Separator />

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="quote-note" className="text-base font-semibold">
          Note
        </Label>
        <Textarea
          id="quote-note"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Add a note for the client..."
          rows={4}
          readOnly={readOnly}
          aria-label="Quote note"
        />
      </div>

      {/* Send to LINE */}
      {!readOnly && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={onSendToLine}
            disabled={isSending || items.length === 0}
          >
            {isSending ? "Sending..." : "發送到 LINE"}
          </Button>
        </div>
      )}
    </div>
  );
}
