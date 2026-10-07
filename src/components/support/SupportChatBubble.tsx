import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { ChatIcon, CloseIcon } from "@/components/icons";
import { Button } from "@/components/ui";
import { selectIsAuthenticated } from "@/features/auth/authSlice";
import { useSupportChat } from "@/lib/useSupportChat";
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
        className="fixed end-[16px] bottom-[16px] z-40 flex size-[58px] items-center justify-center rounded-full bg-brand-gradient text-ink-inverse shadow-overlay transition-transform duration-normal ease-standard hover:scale-105 active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:end-[24px] sm:bottom-[24px]"
      >
        {open ? <CloseIcon size={24} /> : <ChatIcon size={28} weight="fill" />}
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
