import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetChatMessagesQuery,
  useGetChatsQuery,
  useMarkChatsReadMutation,
  useSendChatMessageMutation,
} from "@/app/api/accountApis";
import { formatHumanDateTime, localizedString } from "@/lib/api/locale";
import {
  useSupportChatRealtime,
  type SupportChatConnectionState,
} from "@/lib/supportChatRealtime";

export type ChatMessage = {
  from: "you" | "agent";
  body: string;
  meta: string;
};

export function formatChatTimestamp(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const timeOnly = /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i.exec(raw);
  if (timeOnly) {
    const date = new Date();
    let hours = Number(timeOnly[1]);
    if (timeOnly[3]?.toUpperCase() === "PM" && hours < 12) hours += 12;
    if (timeOnly[3]?.toUpperCase() === "AM" && hours === 12) hours = 0;
    date.setHours(hours, Number(timeOnly[2]), 0, 0);
    return formatHumanDateTime(date);
  }

  return formatHumanDateTime(raw);
}

function mapChatMessage(
  record: Record<string, unknown>,
  labels: { you: string; agent: string },
): ChatMessage {
  const sender = String(
    record.sender ?? record.from ?? record.role ?? "",
  ).toLowerCase();
  const from: ChatMessage["from"] =
    sender.includes("user") ||
    sender.includes("you") ||
    sender.includes("guest")
      ? "you"
      : "agent";
  const author = String(
    record.author ??
      record.agent_name ??
      (from === "you" ? labels.you : labels.agent),
  );
  const time = formatChatTimestamp(
    record.created_at ?? record.createdAt ?? record.time,
  );
  return {
    from,
    body: String(record.body ?? record.message ?? record.content ?? ""),
    meta: time ? `${author} · ${time}` : author,
  };
}

function pickSupportChat(
  chats: Record<string, unknown>[],
): Record<string, unknown> | undefined {
  const support = chats.find((chat) => {
    const channel = String(chat.channel ?? chat.type ?? "").toLowerCase();
    return channel.includes("support") || channel === "";
  });
  return support ?? chats[0];
}

function getChatId(
  chat: Record<string, unknown> | undefined,
): string | number | undefined {
  const raw = chat?.id ?? chat?.chat_id ?? chat?.chatId;
  if (typeof raw === "string" || typeof raw === "number") return raw;
  return undefined;
}

function getChatAgentName(
  chat: Record<string, unknown> | undefined,
): string | undefined {
  if (!chat) return undefined;
  const candidates = [
    chat.assignedTo,
    chat.assigned_to,
    chat.supportAgent,
    chat.support_agent,
    chat.agent,
    chat.agent_name,
    chat.recipient,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim())
      return candidate.trim();
    if (!candidate || typeof candidate !== "object") continue;
    const record = candidate as Record<string, unknown>;
    const name = localizedString(
      record.name ??
        record.displayName ??
        record.display_name ??
        record.fullName ??
        record.full_name,
    );
    if (name) return name;
  }

  return undefined;
}

/**
 * The signed-in user's support conversation — history, live updates over the
 * socket (polling every 5s until it is up), read receipts and sending.
 * Nothing is fetched or connected while `enabled` is false.
 */
export function useSupportChat(enabled: boolean) {
  const { t } = useTranslation("account");
  const { data: chats } = useGetChatsQuery(undefined, { skip: !enabled });
  const supportChat = useMemo(
    () => (chats && chats.length > 0 ? pickSupportChat(chats) : undefined),
    [chats],
  );
  const chatId = getChatId(supportChat);
  /** Undefined until support has picked the conversation up. */
  const agentName = getChatAgentName(supportChat);
  const [socketState, setSocketState] =
    useState<SupportChatConnectionState>("idle");
  const { data: apiMessages } = useGetChatMessagesQuery(chatId ?? "", {
    skip: !enabled || chatId == null,
    pollingInterval: socketState === "subscribed" ? 0 : 5000,
  });
  useSupportChatRealtime(chatId, apiMessages !== undefined, setSocketState);
  const [sendMessage, sendState] = useSendChatMessageMutation();
  const [markRead] = useMarkChatsReadMutation();

  useEffect(() => {
    if (!enabled || chatId == null) return;
    void markRead({ chatIds: [Number(chatId)] });
  }, [chatId, enabled, markRead]);

  const youLabel = t("support.you");
  const agentLabel = agentName ?? t("support.agent");
  const messages = useMemo(
    () =>
      (apiMessages ?? []).map((record) =>
        mapChatMessage(record, { you: youLabel, agent: agentLabel }),
      ),
    [agentLabel, apiMessages, youLabel],
  );

  /** Resolves false when the API rejects the message, so the draft can stay. */
  const send = useCallback(
    async (message: string) => {
      try {
        await sendMessage({
          chatId: chatId != null ? Number(chatId) : undefined,
          channel: "support",
          message,
        }).unwrap();
        return true;
      } catch {
        return false;
      }
    },
    [chatId, sendMessage],
  );

  return {
    agentName,
    socketState,
    messages,
    send,
    sending: sendState.isLoading,
  };
}
