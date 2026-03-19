import axios, { type AxiosInstance } from "axios";
import type {
  Client,
  CreateClientInput,
  DashboardMetrics,
  DocItem,
  FieldDef,
  HandoffItem,
  Message,
  PaymentItem,
  Stage,
  TimelineEvent,
} from "../types/index.js";

export interface ListClientsParams {
  stage?: string;
  source?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export class SageApiClient {
  private http: AxiosInstance;

  constructor(baseUrl: string, token?: string) {
    this.http = axios.create({
      baseURL: baseUrl,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  // ── Config ──

  async getFields(): Promise<FieldDef[]> {
    const { data } = await this.http.get<FieldDef[]>("/config/fields");
    return data;
  }

  async getPipeline(): Promise<Stage[]> {
    const { data } = await this.http.get<Stage[]>("/config/pipeline");
    return data;
  }

  // ── Clients ──

  async listClients(params?: ListClientsParams): Promise<Client[]> {
    const { data } = await this.http.get<Client[]>("/clients", { params });
    return data;
  }

  async getClient(id: string): Promise<Client> {
    const { data } = await this.http.get<Client>(`/clients/${id}`);
    return data;
  }

  async createClient(input: CreateClientInput): Promise<Client> {
    const { data } = await this.http.post<Client>("/clients", input);
    return data;
  }

  async updateClient(id: string, input: Partial<Client>): Promise<Client> {
    const { data } = await this.http.patch<Client>(`/clients/${id}`, input);
    return data;
  }

  async moveStage(id: string, stageId: string): Promise<Client> {
    const { data } = await this.http.patch<Client>(`/clients/${id}/stage`, {
      stage_id: stageId,
    });
    return data;
  }

  // ── Analytics ──

  async getAnalytics(): Promise<DashboardMetrics> {
    const { data } = await this.http.get<DashboardMetrics>("/analytics");
    return data;
  }

  // ── Handoffs ──

  async listHandoffs(): Promise<HandoffItem[]> {
    const { data } = await this.http.get<HandoffItem[]>("/handoffs");
    return data;
  }

  async handoffToHuman(clientId: string): Promise<void> {
    await this.http.post(`/handoffs/${clientId}/to-human`);
  }

  async handoffToAi(clientId: string): Promise<void> {
    await this.http.post(`/handoffs/${clientId}/to-ai`);
  }

  // ── Client sub-resources ──

  async listTimeline(clientId: string): Promise<TimelineEvent[]> {
    const { data } = await this.http.get<TimelineEvent[]>(
      `/clients/${clientId}/timeline`,
    );
    return data;
  }

  async listDocs(clientId: string): Promise<DocItem[]> {
    const { data } = await this.http.get<DocItem[]>(
      `/clients/${clientId}/docs`,
    );
    return data;
  }

  async listPayments(clientId: string): Promise<PaymentItem[]> {
    const { data } = await this.http.get<PaymentItem[]>(
      `/clients/${clientId}/payments`,
    );
    return data;
  }

  // ── Messages ──

  async sendReply(clientId: string, text: string): Promise<void> {
    await this.http.post(`/clients/${clientId}/messages`, { text });
  }

  async listMessages(clientId: string): Promise<Message[]> {
    const { data } = await this.http.get<Message[]>(
      `/clients/${clientId}/messages`,
    );
    return data;
  }
}
