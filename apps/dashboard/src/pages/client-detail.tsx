import { useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useSageApi,
  useClient,
  useConfig,
  useClientMutations,
  useHandoffs,
} from "@motosan/sage-ui";
import type { DocItem } from "@motosan/sage-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ClientProfileTab } from "@/components/client-profile-tab";
import { ClientChatTab } from "@/components/client-chat-tab";
import { ClientDocsTab } from "@/components/client-docs-tab";
import { ClientPaymentsTab } from "@/components/client-payments-tab";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const api = useSageApi();

  const { client, docs, payments, messages, isLoading } = useClient(
    api,
    id ?? "",
  );
  const { stages, clientFields } = useConfig(api);
  const mutations = useClientMutations(api, id ?? "");
  const { handoffs } = useHandoffs(api);

  // Determine if current client is in human mode
  const isHumanMode = useMemo(() => {
    return handoffs.some(
      (h) =>
        h.client_id === id &&
        (h.status === "pending" || h.status === "accepted"),
    );
  }, [handoffs, id]);

  const handleStageChange = useCallback(
    (stageId: string) => {
      mutations.moveStage(stageId);
    },
    [mutations],
  );

  const handleUpdateDoc = useCallback(
    async (docName: string, status: DocItem["status"]) => {
      await mutations.updateDoc({ docName, update: { status } });
    },
    [mutations],
  );

  const handleHandoffToHuman = useCallback(async () => {
    await mutations.handoffToHuman();
  }, [mutations]);

  const handleHandoffToAi = useCallback(async () => {
    await mutations.handoffToAi();
  }, [mutations]);

  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading client details">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Client not found.</p>
        <Button
          variant="link"
          onClick={() => navigate("/clients")}
          className="mt-2"
        >
          Back to Clients
        </Button>
      </div>
    );
  }

  const currentStage = stages.find((s) => s.id === client.stage_id);

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/clients")}
        className="mb-2"
      >
        &larr; Back to Clients
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left side: name, contact, tags */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {client.line_user_id && (
              <span>LINE: @{client.line_user_id}</span>
            )}
            {client.email && <span>Email: {client.email}</span>}
            {client.phone && <span>Phone: {client.phone}</span>}
          </div>
          {client.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {client.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Right side: stage, source, handoff */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Stage:</span>
            <Select value={client.stage_id} onValueChange={handleStageChange}>
              <SelectTrigger className="h-8 w-[160px]" aria-label="Change client stage">
                <SelectValue>
                  {currentStage?.name ?? client.stage_id}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {client.source && (
            <Badge variant="secondary">{client.source}</Badge>
          )}

          {isHumanMode ? (
            <Button variant="outline" size="sm" onClick={handleHandoffToAi}>
              交回 AI
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={handleHandoffToHuman}>
              接管
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">資料</TabsTrigger>
          <TabsTrigger value="chat">對話</TabsTrigger>
          <TabsTrigger value="docs">文件</TabsTrigger>
          <TabsTrigger value="payments">收款</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ClientProfileTab
            client={client}
            clientFields={clientFields}
            onSave={mutations.updateClient}
            isSaving={mutations.isUpdatingClient}
          />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <ClientChatTab
            messages={messages}
            isHumanMode={isHumanMode}
            onSendReply={mutations.sendReply}
            isSending={mutations.isSendingReply}
            onHandoffToHuman={handleHandoffToHuman}
            onHandoffToAi={handleHandoffToAi}
          />
        </TabsContent>

        <TabsContent value="docs" className="mt-6">
          <ClientDocsTab docs={docs} onUpdateDoc={handleUpdateDoc} />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <ClientPaymentsTab
            payments={payments}
            onCreatePayment={mutations.createPayment}
            isCreating={mutations.isCreatingPayment}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
