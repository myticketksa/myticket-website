import { useTranslation } from "react-i18next";
import { DropdownMenu } from "radix-ui";
import { BellIcon } from "@/components/icons";
import { Button } from "@/components/ui";
import { CountBadge } from "@/components/data-display";
import { useLocale } from "@/i18n/locale";
import { useGetNotificationsQuery } from "@/app/api/accountApis";
import { formatHumanDateTime } from "@/lib/api/locale";
import { isUnreadNotification } from "@/lib/notifications/unread";
import { cn } from "@/lib/cn";

/**
 * Notifications, read from the bell rather than from a page of their own.
 *
 * A notification is a glance, not a destination — sending someone to a separate
 * screen to find out that their tickets are ready costs a navigation each way
 * and loses their place. The bell now opens the list where they are standing.
 */
const SHOWN = 8;

type Row = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

function toRow(record: Record<string, unknown>, index: number): Row {
  const created =
    record.created_at ?? record.sent_at ?? record.time ?? record.createdAt;
  return {
    id: String(record.id ?? record.notification_id ?? index),
    title: String(record.title ?? record.subject ?? "—"),
    body: String(record.body ?? record.message ?? record.content ?? ""),
    time: formatHumanDateTime(created) || "",
    unread: isUnreadNotification(record),
  };
}

export function NotificationsMenu() {
  const { t } = useTranslation(["nav", "account", "common"]);
  const { locale } = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const { data, isLoading } = useGetNotificationsQuery();
  const rows = (Array.isArray(data) ? data : [])
    .map((record, index) => toRow(record as Record<string, unknown>, index))
    .slice(0, SHOWN);
  const unread = rows.filter((row) => row.unread).length;

  return (
    <DropdownMenu.Root dir={dir}>
      <span className="relative shrink-0">
        <DropdownMenu.Trigger asChild>
          <Button variant="icon" size="sm" aria-label={t("nav:notifications")}>
            <BellIcon size={16} />
          </Button>
        </DropdownMenu.Trigger>
        {unread > 0 && (
          <span className="pointer-events-none absolute -top-[5.5px] -end-[5.5px]">
            <CountBadge
              count={unread}
              className="h-[17px] min-w-[17px] rounded-[9px] text-[10px]"
            />
          </span>
        )}
      </span>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          side="bottom"
          sideOffset={10}
          collisionPadding={12}
          className="z-50 max-h-[70dvh] w-[min(100vw-2rem,360px)] overflow-y-auto rounded-[16px] border border-border-default bg-surface-default p-sm shadow-overlay"
        >
          <p className="px-sm pb-sm pt-[6px] text-[13px] font-bold text-ink-primary">
            {t("nav:notifications")}
          </p>

          {isLoading && (
            <p className="px-sm pb-sm text-[13px] text-ink-secondary">
              {t("common:states.loading")}
            </p>
          )}

          {!isLoading && rows.length === 0 && (
            <p className="px-sm pb-md text-[13px] text-ink-secondary">
              {t("account:notifications.emptyBody")}
            </p>
          )}

          {rows.map((row) => (
            <DropdownMenu.Item
              key={row.id}
              className={cn(
                "flex cursor-default flex-col gap-[2px] rounded-[10px] px-sm py-[10px] outline-none",
                "data-[highlighted]:bg-bg-warm",
                row.unread && "bg-bg-tint-brand/60",
              )}
            >
              <span className="text-[13.5px] font-semibold text-ink-primary">
                {row.title}
              </span>
              {row.body ? (
                <span className="line-clamp-2 text-[12.5px] text-ink-secondary">
                  {row.body}
                </span>
              ) : null}
              {row.time ? (
                <span className="ltr-run text-[11.5px] text-ink-muted">
                  {row.time}
                </span>
              ) : null}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
