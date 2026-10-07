import {
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { Button, TextInput } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { SupportChatConnectionState } from "@/lib/supportChatRealtime";
import type { ChatMessage } from "@/lib/useSupportChat";

/** Avatar, agent name and live-connection status across the top of a chat. */
export function SupportChatAgentBar({
  agentName,
  socketState,
  className,
}: {
  agentName?: string;
  socketState: SupportChatConnectionState;
  className?: string;
}) {
  const { t } = useTranslation("account");
  const initials = agentName
    ? [...agentName.trim()].slice(0, 2).join("").toUpperCase()
    : "MT";

  return (
    <div
      className={cn(
        "flex items-center gap-[14px] border-b border-border-divider",
        className,
      )}
    >
      <div className="relative flex size-[44px] shrink-0 items-center justify-center rounded-[22px] bg-brand-gradient text-[15px] font-extrabold text-ink-inverse">
        {initials}
        <span className="absolute end-0 bottom-0 size-[12px] rounded-full border-2 border-surface-default bg-state-success" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15.5px] font-bold text-ink-primary">
          {agentName
            ? t("support.agentName", { name: agentName })
            : t("support.team")}
        </p>
        <p
          className={`text-[12.5px] font-semibold ${socketState === "subscribed" ? "text-state-success" : "text-ink-muted"}`}
          role="status"
          aria-live="polite"
        >
          {t(`support.socket.${socketState}`)}
        </p>
      </div>
    </div>
  );
}

/**
 * The message log. Sticks to the newest message unless the reader has scrolled
 * up, and always jumps down when their own message lands.
 */
export function SupportChatThread({
  messages,
  empty,
  className,
}: {
  messages: ChatMessage[];
  /** Shown in place of the log while there are no messages. */
  empty?: ReactNode;
  className?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const followLatestRef = useRef(true);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (followLatestRef.current || messages.at(-1)?.from === "you") {
      viewport.scrollTop = viewport.scrollHeight;
      followLatestRef.current = true;
    }
  }, [messages]);

  function handleScroll() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    followLatestRef.current =
      viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop < 80;
  }

  return (
    <div
      ref={viewportRef}
      onScroll={handleScroll}
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto overscroll-contain bg-bg-page",
        className,
      )}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.length === 0 && empty}
      {messages.map((msg) => (
        <div
          key={msg.meta + msg.body}
          className={`flex flex-col ${msg.from === "you" ? "items-end" : "items-start"}`}
        >
          <div
            className={
              msg.from === "you"
                ? "max-w-[90%] rounded-ss-[16px] rounded-se-[16px] rounded-ee-[4px] rounded-es-[16px] bg-brand-gradient px-[16px] py-[13px] text-[14px] leading-[1.55] text-ink-inverse"
                : "max-w-[448px] rounded-ss-[16px] rounded-se-[16px] rounded-ee-[16px] rounded-es-[4px] border border-border-default bg-surface-default px-[16px] py-[13px] text-[14px] leading-[1.55] text-ink-primary"
            }
          >
            {msg.body}
          </div>
          <p className="mt-[5px] text-[11.5px] text-ink-muted">{msg.meta}</p>
        </div>
      ))}
    </div>
  );
}

/** Message box and Send. Keeps the draft when sending fails so it can be retried. */
export function SupportChatComposer({
  onSend,
  sending,
  autoFocus,
  className,
}: {
  onSend: (message: string) => Promise<boolean>;
  sending: boolean;
  autoFocus?: boolean;
  className?: string;
}) {
  const { t } = useTranslation("account");
  const [draft, setDraft] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const message = draft.trim();
    if (!message) return;
    if (await onSend(message)) setDraft("");
  }

  return (
    <form
      className={cn(
        "flex items-center gap-[10px] border-t border-border-divider",
        className,
      )}
      onSubmit={(event) => void handleSubmit(event)}
    >
      <TextInput
        className="flex-1 !rounded-[22px]"
        placeholder={t("support.chatPlaceholder")}
        value={draft}
        autoFocus={autoFocus}
        onChange={(event) => setDraft(event.target.value)}
      />
      <Button size="md" type="submit" disabled={sending || !draft.trim()}>
        {t("support.send")}
      </Button>
    </form>
  );
}
