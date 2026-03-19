import { useCallback, useMemo, useState } from "react";
import type { PaymentItem } from "@motosan/sage-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTWD(amount: number): string {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_BADGE_VARIANT: Record<
  PaymentItem["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  paid: "default",
  partial: "secondary",
  pending: "outline",
  overdue: "destructive",
};

const STATUS_LABELS: Record<PaymentItem["status"], string> = {
  paid: "Paid",
  partial: "Partial",
  pending: "Pending",
  overdue: "Overdue",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ClientPaymentsTabProps {
  payments: PaymentItem[];
  onCreatePayment: (
    input: Omit<PaymentItem, "status"> & { status?: string },
  ) => Promise<unknown>;
  isCreating: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ClientPaymentsTab({
  payments,
  onCreatePayment,
  isCreating,
}: ClientPaymentsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const { totalDue, totalPaid } = useMemo(() => {
    let due = 0;
    let paid = 0;
    for (const p of payments) {
      due += p.amount_due;
      paid += p.amount_paid;
    }
    return { totalDue: due, totalPaid: paid };
  }, [payments]);

  const handleCreate = useCallback(async () => {
    if (!newLabel.trim() || !newAmount) return;
    await onCreatePayment({
      label: newLabel.trim(),
      amount_due: Number(newAmount),
      amount_paid: 0,
      currency: "TWD",
      due_date: newDueDate || undefined,
    });
    setNewLabel("");
    setNewAmount("");
    setNewDueDate("");
    setDialogOpen(false);
  }, [newLabel, newAmount, newDueDate, onCreatePayment]);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatTWD(totalDue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatTWD(totalPaid)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {formatTWD(totalDue - totalPaid)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Payment Items</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">+ 新增收款項目</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Payment Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="payment-label">Label</Label>
                <Input
                  id="payment-label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. First installment"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Amount (TWD)</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-due">Due Date (optional)</Label>
                <Input
                  id="payment-due"
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={isCreating || !newLabel.trim() || !newAmount}
                className="w-full"
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment list */}
      <div className="space-y-2">
        {payments.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No payment items yet.
          </p>
        )}
        {payments.map((payment, idx) => (
          <div
            key={`${payment.label}-${idx}`}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{payment.label}</span>
                <Badge variant={STATUS_BADGE_VARIANT[payment.status]}>
                  {STATUS_LABELS[payment.status]}
                </Badge>
              </div>
              {payment.due_date && (
                <p className="text-xs text-muted-foreground">
                  Due: {new Date(payment.due_date).toLocaleDateString("zh-TW")}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {formatTWD(payment.amount_paid)} / {formatTWD(payment.amount_due)}
              </p>
              <p className="text-xs text-muted-foreground">
                {payment.amount_due > 0
                  ? `${Math.round((payment.amount_paid / payment.amount_due) * 100)}%`
                  : "0%"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
