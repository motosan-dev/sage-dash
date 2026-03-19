import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryError({ message, onRetry }: QueryErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertTriangle className="size-5 text-destructive" />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {message || "載入資料時發生錯誤"}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          重試
        </Button>
      )}
    </div>
  );
}
