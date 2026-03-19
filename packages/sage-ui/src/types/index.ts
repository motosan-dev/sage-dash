// ── Core domain types for sage-dash ──

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  line_user_id?: string;
  stage_id: string;
  source?: string;
  tags: string[];
  custom_fields: Record<string, unknown>;
  created_at: string;
}

export interface CreateClientInput {
  name: string;
  phone?: string;
  email?: string;
  line_user_id?: string;
  stage_id?: string;
  source?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}

export interface Stage {
  id: string;
  name: string;
  stale_days?: number;
}

export interface FieldDef {
  name: string;
  type: "text" | "number" | "date" | "select" | "boolean" | "textarea";
  label: string;
  required?: boolean;
  options?: string[];
  group?: string;
  condition?: Record<string, unknown>;
}

export interface QuoteItem {
  category: string;
  description: string;
  amount: number;
  currency: string;
  converted?: number;
}

export interface DocItem {
  name: string;
  required: boolean;
  status: "pending" | "uploaded" | "verified" | "rejected";
  deadline?: string;
  note?: string;
}

export interface PaymentItem {
  label: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: "pending" | "partial" | "paid" | "overdue";
  due_date?: string;
}

export interface TimelineEvent {
  id: string;
  type: "note" | "call" | "email" | "stage_change" | "payment" | "system";
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
}

export interface DashboardMetrics {
  pipeline_distribution: Record<string, number>;
  conversion_rate: number;
  revenue: number;
  pending_payments: number;
  active_clients: number;
  stale_clients: number;
}

export interface HandoffItem {
  id: string;
  client_id: string;
  client_name: string;
  reason: string;
  status: "pending" | "accepted" | "resolved";
  created_at: string;
  last_message?: string;
}

export interface Message {
  id: string;
  client_id: string;
  role: "user" | "assistant" | "human_agent";
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
