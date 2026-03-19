import { useCallback, useState } from "react";
import type { FieldDef } from "@motosan/sage-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// DynamicForm — renders form fields from a FieldDef[] config
// ---------------------------------------------------------------------------

export interface DynamicFormProps {
  fields: FieldDef[];
  onSubmit: (values: Record<string, unknown>) => void;
  isSubmitting?: boolean;
}

export function DynamicForm({
  fields,
  onSubmit,
  isSubmitting,
}: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});

  const setValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(values);
    },
    [onSubmit, values],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={`field-${field.name}`}>
            {field.label}
            {field.required && (
              <span className="ml-1 text-destructive" aria-hidden="true">
                *
              </span>
            )}
          </Label>
          {renderField(field, values[field.name], setValue)}
        </div>
      ))}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : "Save"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Field renderer
// ---------------------------------------------------------------------------

function renderField(
  field: FieldDef,
  value: unknown,
  onChange: (name: string, value: unknown) => void,
) {
  const id = `field-${field.name}`;

  switch (field.type) {
    case "select":
      return (
        <Select
          value={(value as string) ?? ""}
          onValueChange={(v) => onChange(field.name, v)}
        >
          <SelectTrigger id={id}>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "textarea":
      return (
        <textarea
          id={id}
          rows={3}
          required={field.required}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(field.name, e.target.value)}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      );

    case "boolean":
      return (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(field.name, e.target.checked)}
            className="size-4 rounded border-input"
          />
          <Label htmlFor={id} className="text-sm font-normal">
            {field.label}
          </Label>
        </div>
      );

    case "number":
      return (
        <Input
          id={id}
          type="number"
          required={field.required}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      );

    case "date":
      return (
        <Input
          id={id}
          type="date"
          required={field.required}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      );

    case "text":
    default: {
      // Infer HTML input type from field name for better UX
      const inputType = inferInputType(field.name);
      return (
        <Input
          id={id}
          type={inputType}
          required={field.required}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.label}
        />
      );
    }
  }
}

function inferInputType(name: string): string {
  if (name.includes("email")) return "email";
  if (name.includes("phone") || name.includes("tel")) return "tel";
  return "text";
}
