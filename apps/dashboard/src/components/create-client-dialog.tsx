import { useCallback, useState } from "react";
import {
  useSageApi,
  useConfig,
  useClients,
  type CreateClientInput,
} from "@motosan/sage-ui";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DynamicForm } from "@/components/dynamic-form";

// ---------------------------------------------------------------------------
// CreateClientDialog
// ---------------------------------------------------------------------------

export function CreateClientDialog() {
  const api = useSageApi();
  const { clientFields } = useConfig(api);
  const { createClient } = useClients(api);

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      setIsSubmitting(true);
      try {
        const input: CreateClientInput = {
          name: (values.name as string) ?? "",
          phone: values.phone as string | undefined,
          email: values.email as string | undefined,
          line_user_id: values.line_user_id as string | undefined,
          stage_id: values.stage_id as string | undefined,
          source: values.source as string | undefined,
          tags: values.tags
            ? (values.tags as string).split(",").map((t) => t.trim())
            : undefined,
          custom_fields: extractCustomFields(values, clientFields.map((f) => f.name)),
        };
        await createClient(input);
        setOpen(false);
        toast.success("客戶已新增");
      } catch (error) {
        toast.error("新增客戶失敗", {
          description:
            error instanceof Error ? error.message : "請稍後再試",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [createClient, clientFields],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ New Client</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Client</DialogTitle>
          <DialogDescription>
            Fill in the client details below. Required fields are marked with an
            asterisk.
          </DialogDescription>
        </DialogHeader>
        <DynamicForm
          fields={clientFields}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const KNOWN_KEYS = new Set([
  "name",
  "phone",
  "email",
  "line_user_id",
  "stage_id",
  "source",
  "tags",
]);

function extractCustomFields(
  values: Record<string, unknown>,
  allFieldNames: string[],
): Record<string, unknown> | undefined {
  const custom: Record<string, unknown> = {};
  let hasAny = false;
  for (const key of allFieldNames) {
    if (!KNOWN_KEYS.has(key) && values[key] !== undefined && values[key] !== "") {
      custom[key] = values[key];
      hasAny = true;
    }
  }
  return hasAny ? custom : undefined;
}
