import { useEffect } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { accountApis, type ApiRecord } from "@/app/api/accountApis";
import { selectAuthToken } from "@/features/auth/authSlice";

const EVENT_NAME = ".message.sent";

export type SupportChatConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "subscribed"
  | "disconnected"
  | "error";

function asRecord(value: unknown): ApiRecord | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiRecord)
    : undefined;
}

function normalizeMessage(
  payload: unknown,
  chatId: string | number,
): ApiRecord | undefined {
  const outer = asRecord(payload);
  if (!outer) return undefined;

  const data = asRecord(outer.data) ?? outer;
  const nestedMessage = asRecord(data.message);
  const message = nestedMessage ?? data;
  const rawChatId =
    message.chat_id ?? message.chatId ?? data.chat_id ?? outer.chat_id;
  if (rawChatId != null && String(rawChatId) !== String(chatId))
    return undefined;

  const body =
    message.body ??
    message.message ??
    message.content ??
    (typeof data.message === "string" ? data.message : undefined) ??
    outer.body;
  if (body == null || String(body).trim() === "") return undefined;

  return {
    ...outer,
    ...data,
    ...message,
    body: String(body),
  };
}

function messageId(message: ApiRecord): string | undefined {
  const id = message.id ?? message.message_id ?? message.messageId;
  return id == null ? undefined : String(id);
}

function isDuplicateMessage(
  messages: ApiRecord[],
  incoming: ApiRecord,
): boolean {
  const incomingId = messageId(incoming);
  if (incomingId) {
    return messages.some((message) => messageId(message) === incomingId);
  }

  const incomingBody = String(
    incoming.body ?? incoming.message ?? incoming.content ?? "",
  );
  const incomingSender = String(
    incoming.sender_id ?? incoming.sender ?? incoming.from ?? "",
  );
  const incomingTime = String(
    incoming.created_at ?? incoming.createdAt ?? incoming.time ?? "",
  );
  if (!incomingBody || !incomingTime) return false;

  return messages.some((message) => {
    const body = String(
      message.body ?? message.message ?? message.content ?? "",
    );
    const sender = String(
      message.sender_id ?? message.sender ?? message.from ?? "",
    );
    const time = String(
      message.created_at ?? message.createdAt ?? message.time ?? "",
    );
    return (
      body === incomingBody &&
      sender === incomingSender &&
      time === incomingTime
    );
  });
}

function reverbSettings() {
  const tlsOverride = import.meta.env.VITE_REVERB_FORCE_TLS;
  const forceTLS =
    tlsOverride === "true" ||
    (tlsOverride !== "false" && window.location.protocol === "https:");
  const port = Number(import.meta.env.VITE_REVERB_PORT || 8080);
  const host = import.meta.env.VITE_REVERB_HOST || "72.62.58.90";

  return {
    broadcaster: "reverb" as const,
    key: import.meta.env.VITE_REVERB_APP_KEY || "sry9zdwkcpgoysehvozr",
    wsHost: forceTLS ? import.meta.env.VITE_REVERB_WSS_HOST || host : host,
    wsPort: port,
    wssPort: Number(import.meta.env.VITE_REVERB_WSS_PORT || 443),
    forceTLS,
    enabledTransports: ["ws", "wss"] as ("ws" | "wss")[],
    authEndpoint:
      import.meta.env.VITE_REVERB_AUTH_ENDPOINT ||
      "https://api.myticket.sa/broadcasting/auth",
  };
}

/** Subscribe to the authenticated private support channel and merge incoming messages into history. */
export function useSupportChatRealtime(
  chatId: string | number | undefined,
  historyReady: boolean,
  onStatusChange: (state: SupportChatConnectionState) => void,
) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAuthToken);

  useEffect(() => {
    if (chatId == null || !token || !historyReady) {
      onStatusChange("idle");
      return;
    }

    onStatusChange("connecting");

    const echo = new Echo({
      ...reverbSettings(),
      Pusher,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    });
    const connection = echo.connector.pusher.connection;
    const channelName = `chat.${chatId}`;
    const channel = echo.private(channelName);
    const onConnectionStateChange = ({ current }: { current: string }) => {
      if (current === "connected") onStatusChange("connected");
      else if (current === "failed") onStatusChange("error");
      else if (current === "disconnected") onStatusChange("disconnected");
      else onStatusChange("connecting");
    };
    const onConnectionError = () => onStatusChange("error");
    const onSubscribed = () => onStatusChange("subscribed");
    const onSubscriptionError = () => onStatusChange("error");
    const onMessage = (payload: unknown) => {
      const incoming = normalizeMessage(payload, chatId);
      if (!incoming) return;

      dispatch(
        accountApis.util.updateQueryData(
          "getChatMessages",
          chatId,
          (messages) => {
            if (!isDuplicateMessage(messages, incoming))
              messages.push(incoming);
          },
        ),
      );
    };

    connection.bind("state_change", onConnectionStateChange);
    connection.bind("error", onConnectionError);
    channel.subscribed(onSubscribed);
    channel.error(onSubscriptionError);
    channel.listen(EVENT_NAME, onMessage);

    return () => {
      channel.stopListening(EVENT_NAME, onMessage);
      connection.unbind("state_change", onConnectionStateChange);
      connection.unbind("error", onConnectionError);
      echo.leave(channelName);
      echo.disconnect();
    };
  }, [chatId, dispatch, historyReady, onStatusChange, token]);
}
