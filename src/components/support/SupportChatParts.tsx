import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { CloseIcon, ImageIcon } from "@/components/icons";
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
  const { t } = useTranslation("account");
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
        // Yours on the right and support's on the left in both languages, as
        // chat apps place them. The logical sides flipped them on the Arabic
        // site; text inside still runs in its own direction.
        <div
          key={msg.meta + msg.body + (msg.image ?? "")}
          dir="ltr"
          className={`flex flex-col ${msg.from === "you" ? "items-end" : "items-start"}`}
        >
          <div
            dir="auto"
            className={
              msg.from === "you"
                ? "max-w-[90%] rounded-[16px] rounded-br-[4px] bg-brand-gradient px-[16px] py-[13px] text-[14px] leading-[1.55] text-ink-inverse"
                : "max-w-[448px] rounded-[16px] rounded-bl-[4px] border border-border-default bg-surface-default px-[16px] py-[13px] text-[14px] leading-[1.55] text-ink-primary"
            }
          >
            {msg.image && (
              <a
                href={msg.image}
                target="_blank"
                rel="noreferrer"
                className={cn("block", msg.body && "mb-[8px]")}
              >
                <img
                  src={msg.image}
                  alt={t("support.photo")}
                  className="max-h-[280px] w-full max-w-[320px] rounded-[10px] object-cover"
                />
              </a>
            )}
            {msg.body}
          </div>
          <p dir="auto" className="mt-[5px] text-[11.5px] text-ink-muted">{msg.meta}</p>
        </div>
      ))}
    </div>
  );
}

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/**
 * Message box, a photo button and Send. Keeps the draft and the photo when
 * sending fails so it can be retried. A photo can also be pasted in.
 */
export function SupportChatComposer({
  onSend,
  sending,
  autoFocus,
  className,
}: {
  onSend: (message: string, image?: File | null) => Promise<boolean>;
  sending: boolean;
  autoFocus?: boolean;
  className?: string;
}) {
  const { t } = useTranslation("account");
  const [draft, setDraft] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tooBig, setTooBig] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  function pick(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setTooBig(true);
      return;
    }
    setTooBig(false);
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  function clearPhoto() {
    setPhoto(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const message = draft.trim();
    if (!message && !photo) return;
    if (await onSend(message, photo)) {
      setDraft("");
      clearPhoto();
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-[10px] border-t border-border-divider", className)}
      onSubmit={(event) => void handleSubmit(event)}
    >
      {(preview || tooBig) && (
        <div className="flex items-center gap-[12px]">
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt={t("support.photo")}
                className="size-[64px] rounded-[10px] object-cover"
              />
              <button
                type="button"
                onClick={clearPhoto}
                aria-label={t("support.removePhoto")}
                title={t("support.removePhoto")}
                className="absolute -end-[8px] -top-[8px] flex size-[22px] items-center justify-center rounded-full bg-ink-primary text-ink-inverse"
              >
                <CloseIcon size={12} />
              </button>
            </div>
          )}
          {tooBig && (
            <p className="text-[12.5px] text-state-danger" role="alert">
              {t("support.photoTooBig")}
            </p>
          )}
        </div>
      )}
      <div className="flex items-center gap-[10px]">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => pick(event.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label={t("support.attachPhoto")}
          title={t("support.attachPhoto")}
          className="flex size-[44px] shrink-0 items-center justify-center rounded-full border border-border-default text-ink-secondary transition-colors hover:border-border-brand hover:text-ink-brand"
        >
          <ImageIcon size={20} />
        </button>
        <TextInput
          className="flex-1 !rounded-[22px]"
          placeholder={t("support.chatPlaceholder")}
          value={draft}
          autoFocus={autoFocus}
          onChange={(event) => setDraft(event.target.value)}
          onPaste={(event) => {
            const file = Array.from(event.clipboardData.files).find((f) =>
              f.type.startsWith("image/"),
            );
            if (file) {
              event.preventDefault();
              pick(file);
            }
          }}
        />
        <Button size="md" type="submit" disabled={sending || (!draft.trim() && !photo)}>
          {t("support.send")}
        </Button>
      </div>
    </form>
  );
}
