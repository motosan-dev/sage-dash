import { useCallback } from "react";
import type { Client, FieldDef } from "@motosan/sage-ui";
import { DynamicForm } from "@/components/dynamic-form";

interface ClientProfileTabProps {
  client: Client;
  clientFields: FieldDef[];
  onSave: (values: Record<string, unknown>) => Promise<unknown>;
  isSaving: boolean;
}

export function ClientProfileTab({
  client,
  clientFields,
  onSave,
  isSaving,
}: ClientProfileTabProps) {
  const handleSubmit = useCallback(
    (values: Record<string, unknown>) => {
      onSave({ custom_fields: values });
    },
    [onSave],
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-lg font-medium">Client Profile</h3>
        <p className="text-sm text-muted-foreground">
          Custom fields for this client. Changes are saved when you click Save.
        </p>
      </div>
      <DynamicForm
        fields={clientFields}
        initialValues={client.custom_fields}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
      />
    </div>
  );
}
