import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { TextInput } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatMoneySar } from "@/lib/api/locale";

/**
 * Per-ticket booking, as the app and the original website both do it.
 *
 * Both open with a "number of tickets" plus/minus row, then render one card per
 * ticket — "Ticket 1", "Ticket 2" — each carrying the attendee's name and that
 * ticket's type. The web had neither: quantity lived in per-tier steppers and
 * the names were asked for two pages later on the checkout screen, so there was
 * no point in the flow where a buyer could see who each ticket was for.
 */
export type BookingTicket = {
  /** Attendee name. Required before an order can be created. */
  name: string;
  ticketTypeId: number;
  /** Assigned seating only, filled in by the seat map. */
  seatId?: number;
  seatLabel?: string;
};

export interface TicketTypeOption {
  id: number;
  name: string;
  price: number;
  remaining?: number;
  disabled?: boolean;
}

export interface TicketBookingListProps {
  tickets: BookingTicket[];
  types: TicketTypeOption[];
  onChange: (tickets: BookingTicket[]) => void;
  /** Hard ceiling, usually the stock left on the chosen showtime. */
  max?: number;
  className?: string;
}

export const MAX_TICKETS_PER_ORDER = 6;

export function TicketBookingList({
  tickets,
  types,
  onChange,
  max = MAX_TICKETS_PER_ORDER,
  className,
}: TicketBookingListProps) {
  const { t } = useTranslation(["catalog", "common"]);
  const selectable = types.filter((type) => !type.disabled);
  const ceiling = Math.max(0, Math.min(max, MAX_TICKETS_PER_ORDER));
  const canAdd = selectable.length > 0 && tickets.length < ceiling;
  const canRemove = tickets.length > 0;

  function addTicket() {
    if (!canAdd) return;
    const previous = tickets[tickets.length - 1];
    onChange([
      ...tickets,
      {
        name: "",
        ticketTypeId: previous?.ticketTypeId ?? selectable[0]!.id,
      },
    ]);
  }

  function removeTicket() {
    if (!canRemove) return;
    onChange(tickets.slice(0, -1));
  }

  function patch(index: number, next: Partial<BookingTicket>) {
    onChange(
      tickets.map((ticket, i) => (i === index ? { ...ticket, ...next } : ticket)),
    );
  }

  return (
    <div className={cn("flex flex-col gap-sm", className)}>
      <div className="flex items-center justify-between gap-md rounded-[14px] border border-border-default bg-surface-default px-[14px] py-[10px]">
        <span className="text-[14px] font-medium text-ink-primary">
          {t("detail.ticketsNumber")}
        </span>
        <div className="flex items-center gap-[10px]">
          <StepperButton
            label={t("detail.removeTicket")}
            disabled={!canRemove}
            onClick={removeTicket}
          >
            <MinusIcon size={16} />
          </StepperButton>
          <span className="ltr-run min-w-[1.5ch] text-center text-[15px] font-semibold tabular-nums text-ink-primary">
            {tickets.length}
          </span>
          <StepperButton
            label={t("detail.addTicket")}
            disabled={!canAdd}
            onClick={addTicket}
          >
            <PlusIcon size={16} />
          </StepperButton>
        </div>
      </div>

      {tickets.length === 0 && (
        <p className="text-[13px] text-ink-secondary">
          {t("detail.addTicketHint")}
        </p>
      )}

      {tickets.map((ticket, index) => (
        <div
          key={index}
          className="flex flex-col gap-xs rounded-[14px] border border-border-default bg-surface-default p-[14px]"
        >
          <span className="text-[13px] font-semibold text-ink-primary">
            {t("detail.ticketNumber", { n: index + 1 })}
          </span>

          <TextInput
            value={ticket.name}
            onChange={(event) => patch(index, { name: event.target.value })}
            placeholder={t("detail.attendeeName")}
            aria-label={t("detail.attendeeNameFor", { n: index + 1 })}
            className="bg-bg-page"
          />

          {selectable.length > 1 && (
            <select
              value={ticket.ticketTypeId}
              onChange={(event) =>
                patch(index, { ticketTypeId: Number(event.target.value) })
              }
              aria-label={t("detail.ticketTypeFor", { n: index + 1 })}
              className="h-[42px] rounded-[12px] border border-border-default bg-bg-page px-[12px] text-[14px] text-ink-primary"
            >
              {selectable.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} · {formatMoneySar(type.price)}
                </option>
              ))}
            </select>
          )}

          {ticket.seatLabel && (
            <span className="text-[13px] text-ink-secondary">
              {t("detail.seatLabel", { seat: ticket.seatLabel })}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function StepperButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-[34px] items-center justify-center rounded-[12px] border border-border-default bg-surface-default",
        disabled
          ? "cursor-not-allowed text-ink-disabled"
          : "text-ink-primary hover:border-border-brand",
      )}
    >
      {children}
    </button>
  );
}
