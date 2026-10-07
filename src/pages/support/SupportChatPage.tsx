import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@/components/icons";
import {
  SupportChatAgentBar,
  SupportChatComposer,
  SupportChatThread,
} from "@/components/support";
import { Button } from "@/components/ui";
import { FunnelHeader, PageSection } from "@/layouts";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import {
  formatChatTimestamp,
  useSupportChat,
  type ChatMessage,
} from "@/lib/useSupportChat";

const FALLBACK_FROM = ["you", "agent", "you", "agent"] as const;

const QUICK_LINK_IDS = ["refund", "qr", "waitlists", "gift"] as const;

/** Support chat — Figma `207:12302`. */
export function SupportChatPage() {
  const { t } = useTranslation("account");
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const {
    agentName,
    socketState,
    messages: apiMessages,
    send,
    sending,
  } = useSupportChat(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) requireAuth();
  }, [isAuthenticated, requireAuth]);

  const fallbackMessages = useMemo(() => {
    const rows = t("support.fallback", { returnObjects: true }) as
      | { body: string; time: string }[]
      | string;
    if (!Array.isArray(rows)) return [] as ChatMessage[];
    return rows.map((row, index) => {
      const from = FALLBACK_FROM[index] ?? "agent";
      const author =
        from === "you" ? t("support.you") : (agentName ?? t("support.agent"));
      return {
        from,
        body: row.body,
        meta: `${author} · ${formatChatTimestamp(row.time)}`,
      } satisfies ChatMessage;
    });
  }, [agentName, t]);

  const messages = apiMessages.length > 0 ? apiMessages : fallbackMessages;

  if (!isAuthenticated) return null;

  return (
    <>
      <FunnelHeader
        label={t("support.chatHeader")}
        backHref="/help"
        backLabel={t("support.backHelp")}
      />

      <PageSection padTop={40} padBottom={96}>
        <div className="flex flex-col items-start gap-[28px] lg:flex-row">
          <div className="flex h-[min(70vh,720px)] min-h-[420px] w-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-border-default bg-surface-default sm:min-h-[560px] lg:flex-1">
            <SupportChatAgentBar
              agentName={agentName}
              socketState={socketState}
              className="px-[24px] py-[18px]"
            />
            <SupportChatThread messages={messages} className="p-[24px]" />
            <SupportChatComposer
              onSend={send}
              sending={sending}
              className="px-[24px] py-[16px]"
            />
          </div>

          <aside className="flex w-full flex-col gap-[14px] lg:w-[340px] lg:shrink-0">
            <div className="rounded-[20px] border border-border-default bg-surface-default p-[20px]">
              <p className="text-[15px] font-semibold text-ink-primary">
                {t("support.keepTitle")}
              </p>
              <p className="mt-[10px] text-[13px] leading-[1.55] text-ink-secondary">
                {t("support.keepBody")}
              </p>
              <div className="mt-[14px] flex flex-col gap-[8px]">
                <Link to="/sign-in">
                  <Button size="md" className="w-full">
                    {t("support.keepSignIn")}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[20px] border border-border-default bg-surface-default p-[20px]">
              <p className="text-[15px] font-semibold text-ink-primary">
                {t("support.quickerTitle")}
              </p>
              <ul className="mt-[12px] flex flex-col gap-[9px]">
                {QUICK_LINK_IDS.map((id) => (
                  <li key={id}>
                    <Link
                      to="/help"
                      className="inline-flex items-center gap-[5px] text-[13.5px] font-semibold text-ink-brand hover:text-ink-brand-mid"
                    >
                      {t(`support.quick.${id}`)}
                      <ArrowRightIcon size={14} className="rtl:rotate-180" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[16px] border border-border-default bg-bg-page px-[18px] py-[16px] text-[13px] leading-[1.55] text-ink-secondary">
              {t("support.hours")}
            </div>
          </aside>
        </div>
      </PageSection>
    </>
  );
}
