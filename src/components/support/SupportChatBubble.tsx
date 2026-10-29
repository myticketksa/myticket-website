import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { ChatIcon, CloseIcon } from "@/components/icons";
import { Button } from "@/components/ui";
import { selectIsAuthenticated } from "@/features/auth/authSlice";
import { cn } from "@/lib/cn";
import { useSupportChat } from "@/lib/useSupportChat";
import { SITE_WHATSAPP_URL } from "@/lib/site";
import {
  SupportChatAgentBar,
  SupportChatComposer,
  SupportChatThread,
} from "./SupportChatParts";

/** Coming back from sign-in with this query opens the chat straight away. */
const OPEN_PARAM = "chat";

/**
 * Floating support chat for the home page: a round button bottom-end that
 * opens a compact live-support panel above it. Guests get a sign-in prompt
 * that brings them back here with the panel open.
 */
export function SupportChatBubble() {
  const { t } = useTranslation("account");
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(
    () => searchParams.get(OPEN_PARAM) === "open",
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!searchParams.has(OPEN_PARAM)) return;
    const next = new URLSearchParams(searchParams);
    next.delete(OPEN_PARAM);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  // A guest's "chat with us" is MyTicket's WhatsApp (the footer's number):
  // support chat needs an account (29 Oct 2026).
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  if (!isAuthenticated) {
    return (
      <a
        href={SITE_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed end-[16px] bottom-[16px] z-40 flex h-[58px] items-center justify-center gap-[10px] rounded-full bg-[#25D366] ps-[18px] pe-[22px] text-white shadow-overlay transition-transform duration-normal ease-standard hover:scale-105 active:scale-95 motion-reduce:hover:scale-100 sm:end-[24px] sm:bottom-[24px]"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43a9.38 9.38 0 0 1 9.42 9.44c0 5.2-4.23 9.43-9.43 9.43zm8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.8.72.71 5.8.71 12.05c0 2 .52 3.95 1.52 5.66L.62 23.28l5.71-1.5a11.3 11.3 0 0 0 5.71 1.46h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.32-8.02z" />
        </svg>
        <span className="text-[15px] font-bold whitespace-nowrap">{t("support.chatWithUs")}</span>
      </a>
    );
  }

  return (
    <>
      {open && <SupportChatPanel id={panelId} />}
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? t("support.bubbleClose") : t("support.bubbleOpen")}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => (open ? close() : setOpen(true))}
        className={cn(
          "fixed end-[16px] bottom-[16px] z-40 flex h-[58px] items-center justify-center gap-[10px] rounded-full bg-brand-gradient text-ink-inverse shadow-overlay transition-transform duration-normal ease-standard hover:scale-105 active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:end-[24px] sm:bottom-[24px]",
          // Closed, it says what it is: an icon alone was easy to miss.
          open ? "w-[58px]" : "support-bubble-pulse ps-[18px] pe-[22px]",
        )}
      >
        {open ? (
          <CloseIcon size={24} />
        ) : (
          <>
            <ChatIcon size={26} weight="fill" />
            <span className="text-[15px] font-bold whitespace-nowrap">
              {t("support.chatWithUs")}
            </span>
          </>
        )}
      </button>
    </>
  );
}

function SupportChatPanel({ id }: { id: string }) {
  const { t } = useTranslation("account");
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { agentName, socketState, messages, send, sending } =
    useSupportChat(isAuthenticated);

  return (
    <section
      id={id}
      aria-label={t("support.chatHeader")}
      className="fixed end-[16px] bottom-[86px] z-40 flex h-[min(560px,calc(100dvh-120px))] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[22px] border border-border-default bg-surface-default shadow-overlay sm:end-[24px] sm:bottom-[96px] sm:w-[380px]"
    >
      {isAuthenticated ? (
        <>
          <SupportChatAgentBar
            agentName={agentName}
            socketState={socketState}
            className="px-[18px] py-[14px]"
          />
          <SupportChatThread
            messages={messages}
            className="p-[16px]"
            empty={
              <p className="max-w-[90%] self-start rounded-ss-[16px] rounded-se-[16px] rounded-ee-[16px] rounded-es-[4px] border border-border-default bg-surface-default px-[16px] py-[13px] text-[14px] leading-[1.55] text-ink-primary">
                {t("support.bubbleGreeting")}
              </p>
            }
          />
          <SupportChatComposer
            onSend={send}
            sending={sending}
            autoFocus
            className="px-[16px] py-[12px]"
          />
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-[14px] p-[28px] text-center">
          <span className="flex size-[56px] items-center justify-center rounded-full bg-brand-gradient text-ink-inverse">
            <ChatIcon size={28} weight="fill" />
          </span>
          <p className="text-[16px] font-bold text-ink-primary">
            {t("support.chatHeader")}
          </p>
          <p className="text-[13.5px] leading-[1.55] text-ink-secondary">
            {t("support.bubbleSignInBody")}
          </p>
          <Button
            onClick={() =>
              navigate(
                `/sign-in?next=${encodeURIComponent(`/?${OPEN_PARAM}=open`)}`,
              )
            }
          >
            {t("support.bubbleSignIn")}
          </Button>
          <p className="text-[12px] leading-[1.5] text-ink-muted">
            {t("support.hours")}
          </p>
        </div>
      )}
    </section>
  );
}
