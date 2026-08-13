import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckIcon,
  CloseIcon,
  InfoIcon,
  MinusIcon,
  PlusIcon,
  SparkleIcon,
} from '@/components/icons'
import { Divider, FilterChip, PriceDisplay } from '@/components/data-display'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

type SeatStatus = 'available' | 'vip' | 'gold' | 'silver' | 'bronze' | 'sold' | 'held' | 'selected' | 'accessible'
type Zone = 'all' | 'vip' | 'gold' | 'silver' | 'bronze'

interface SelectedSeat {
  id: string
  label: string
  category: string
  price: number
}

const ZONES: { id: Zone; label: string }[] = [
  { id: 'all', label: 'All zones' },
  { id: 'vip', label: 'VIP' },
  { id: 'gold', label: 'Gold' },
  { id: 'silver', label: 'Silver' },
  { id: 'bronze', label: 'Bronze' },
]

const PRICE_TIERS = [
  { tone: 'bg-seat-vip', label: 'VIP front rows', left: '34 left', price: 'SAR 680+' },
  { tone: 'bg-brand-primary', label: 'Gold', left: '32 left', price: 'SAR 480+' },
  { tone: 'bg-seat-silver', label: 'Silver', left: '117 left', price: 'SAR 260+' },
  { tone: 'bg-seat-bronze', label: 'Bronze rear', left: '73 left', price: 'SAR 180+' },
] as const

/** Compact seat-map fixture — enough rows to read like the Figma hall. */
function buildRow(row: string, pattern: SeatStatus[]): { id: string; status: SeatStatus }[] {
  return pattern.map((status, index) => ({
    id: `${row}${index + 1}`,
    status,
  }))
}

const FLOOR_ROWS: { row: string; seats: ReturnType<typeof buildRow> }[] = [
  {
    row: 'A',
    seats: buildRow(
      'A',
      Array.from({ length: 24 }, (_, i) =>
        [4, 7, 10, 15, 18, 21].includes(i) ? 'sold' : 'vip',
      ),
    ),
  },
  {
    row: 'B',
    seats: buildRow(
      'B',
      Array.from({ length: 24 }, (_, i) => {
        if (i === 4) return 'held'
        if ([0, 3, 8, 14, 19].includes(i)) return 'sold'
        return 'vip'
      }),
    ),
  },
  {
    row: 'C',
    seats: buildRow(
      'C',
      Array.from({ length: 24 }, (_, i) => {
        if ([2, 6, 15, 20].includes(i)) return 'sold'
        if (i < 4) return 'vip'
        return 'gold'
      }),
    ),
  },
  {
    row: 'D',
    seats: buildRow(
      'D',
      Array.from({ length: 24 }, (_, i) => ([3, 9, 16].includes(i) ? 'sold' : 'gold')),
    ),
  },
  {
    row: 'E',
    seats: buildRow(
      'E',
      Array.from({ length: 24 }, (_, i) => ([1, 11, 18].includes(i) ? 'sold' : 'gold')),
    ),
  },
  {
    row: 'F',
    seats: buildRow(
      'F',
      Array.from({ length: 24 }, (_, i) => ([5, 14].includes(i) ? 'sold' : 'gold')),
    ),
  },
]

const MEZZ_ROWS = ['G', 'H', 'I', 'J', 'K'].map((row, rowIndex) => ({
  row,
  seats: buildRow(
    row,
    Array.from({ length: 28 }, (_, i) => {
      if ((i + rowIndex) % 7 === 0) return 'sold'
      if (i === 20 && row === 'H') return 'accessible'
      return 'silver'
    }),
  ),
}))

const UPPER_ROWS = ['L', 'M', 'N'].map((row, rowIndex) => ({
  row,
  seats: buildRow(
    row,
    Array.from({ length: 30 }, (_, i) => {
      if ((i + rowIndex) % 5 === 0) return 'sold'
      return 'bronze'
    }),
  ),
}))

const INITIAL_SELECTED: SelectedSeat[] = [
  {
    id: 'C11',
    label: 'Row C, seat 11',
    category: 'Gold · Floor – Block A',
    price: 520,
  },
  {
    id: 'C12',
    label: 'Row C, seat 12',
    category: 'Gold · Floor – Block A',
    price: 520,
  },
]

function seatClass(status: SeatStatus) {
  switch (status) {
    case 'vip':
      return 'border-seat-vip bg-seat-vip-tint'
    case 'gold':
      return 'border-brand-primary bg-seat-gold-tint'
    case 'silver':
      return 'border-seat-silver bg-seat-silver-tint'
    case 'bronze':
      return 'border-ink-muted bg-seat-bronze-tint'
    case 'sold':
      return 'border-border-default bg-seat-sold'
    case 'held':
      return 'border-neutral-scrollbar bg-[repeating-linear-gradient(135deg,var(--color-border-divider)_0_3px,var(--color-neutral-scrollbar)_3px_6px)]'
    case 'selected':
      return 'border-transparent bg-brand-gradient text-ink-inverse'
    case 'accessible':
      return 'border-ink-brand bg-bg-tint-brand'
    default:
      return 'border-border-default bg-border-divider'
  }
}

function SeatButton({
  status,
  onClick,
  label,
}: {
  status: SeatStatus
  onClick?: () => void
  label: string
}) {
  const interactive = status !== 'sold' && status !== 'held'

  return (
    <button
      type="button"
      aria-label={label}
      disabled={!interactive}
      onClick={onClick}
      className={cn(
        'flex size-[19px] items-center justify-center rounded-[5px] border',
        seatClass(status),
        !interactive && 'cursor-not-allowed',
      )}
    >
      {status === 'selected' && <CheckIcon size={10} className="text-ink-inverse" />}
    </button>
  )
}

function SeatBlock({
  title,
  range,
  rows,
  zone,
  selectedIds,
  onToggle,
}: {
  title: string
  range: string
  rows: { row: string; seats: { id: string; status: SeatStatus }[] }[]
  zone: Zone
  selectedIds: Set<string>
  onToggle: (id: string, row: string, index: number, status: SeatStatus) => void
}) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-[10px]">
        <p className="text-[12px] font-bold tracking-[0.96px] text-ink-muted">{title}</p>
        <Divider tone="divider" className="flex-1" />
        <p className="text-[12px] text-ink-muted">{range}</p>
      </div>
      <div className="mt-md flex flex-col items-center gap-[6px]">
        {rows.map(({ row, seats }) => (
          <div key={row} className="flex items-center gap-[10px]">
            <span className="w-[18px] text-right text-[11px] font-semibold text-ink-muted">
              {row}
            </span>
            <div className="flex gap-[4px]">
              {seats.map((seat, index) => {
                const status = selectedIds.has(seat.id) ? 'selected' : seat.status
                const zoneMatch =
                  zone === 'all' ||
                  status === 'selected' ||
                  status === zone ||
                  (status !== 'vip' &&
                    status !== 'gold' &&
                    status !== 'silver' &&
                    status !== 'bronze')
                return (
                  <span
                    key={seat.id}
                    className={cn(!zoneMatch && 'opacity-30')}
                  >
                    <SeatButton
                      status={status}
                      label={`${row}${index + 1}`}
                      onClick={() => onToggle(seat.id, row, index + 1, seat.status)}
                    />
                  </span>
                )
              })}
            </div>
            <span className="w-[18px] text-[11px] font-semibold text-ink-muted">{row}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Seat Selection — Figma `207:7446`. Purchase header comes from `PurchaseLayout`.
 */
export function SeatSelectionPage() {
  const [zone, setZone] = useState<Zone>('all')
  const [selected, setSelected] = useState<SelectedSeat[]>(INITIAL_SELECTED)
  const selectedIds = useMemo(() => new Set(selected.map((seat) => seat.id)), [selected])

  const subtotal = selected.reduce((sum, seat) => sum + seat.price, 0)
  const serviceFee = Math.round(subtotal * 0.05)
  const vat = Math.round((subtotal + serviceFee) * 0.15)
  const total = subtotal + serviceFee + vat

  function toggleSeat(id: string, row: string, number: number, status: SeatStatus) {
    if (status === 'sold' || status === 'held') return

    setSelected((current) => {
      if (current.some((seat) => seat.id === id)) {
        return current.filter((seat) => seat.id !== id)
      }
      if (current.length >= 6) return current

      const price =
        status === 'vip' ? 680 : status === 'gold' || status === 'selected' ? 520 : status === 'silver' ? 260 : 180
      const category =
        status === 'vip'
          ? 'VIP · Floor – Block A'
          : status === 'silver'
            ? 'Silver · Mezzanine – Block B'
            : status === 'bronze'
              ? 'Bronze · Upper Tier – Block C'
              : 'Gold · Floor – Block A'

      return [
        ...current,
        {
          id,
          label: `Row ${row}, seat ${number}`,
          category,
          price,
        },
      ]
    })
  }

  return (
    <div className="flex flex-col gap-[28px] lg:flex-row lg:items-start">
      <section className="min-w-0 flex-1 overflow-hidden rounded-[20px] border border-border-default bg-surface-default">
        <div className="flex flex-wrap items-center justify-between gap-md border-b border-border-divider px-xl py-lg">
          <div className="flex flex-wrap items-center gap-sm">
            <p className="text-[15px] font-semibold text-ink-primary">Hall 1 — Main Arena</p>
            <div className="flex flex-wrap gap-sm">
              {ZONES.map((item) => (
                <FilterChip
                  key={item.id}
                  selected={zone === item.id}
                  onClick={() => setZone(item.id)}
                  className="h-8 rounded-pill px-md text-[13px] font-semibold"
                >
                  {item.label}
                </FilterChip>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <Button
              size="sm"
              variant="secondary"
              icon={<SparkleIcon size={16} />}
              className="h-[34px] rounded-[17px] bg-bg-page px-[14px]"
            >
              Pick best available
            </Button>
            <div className="flex items-center gap-[4px] rounded-[17px] border border-border-default p-[4px]">
              <button type="button" className="flex size-[26px] items-center justify-center rounded-[13px]" aria-label="Zoom out">
                <MinusIcon size={15} />
              </button>
              <span className="w-[34px] text-center text-[12px] font-semibold text-ink-secondary">
                100%
              </span>
              <button type="button" className="flex size-[26px] items-center justify-center rounded-[13px]" aria-label="Zoom in">
                <PlusIcon size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-bg-page via-surface-default via-[55%] to-surface-default px-2xl pt-[30px] pb-[26px]">
          <div className="mx-auto flex w-full max-w-[860px] flex-col items-center">
            <div className="flex h-[46px] w-full items-center justify-center rounded-b-[46px] bg-surface-inverse">
              <p className="text-[13px] font-bold tracking-[3.64px] text-bg-page">STAGE</p>
            </div>

            <div className="mt-[34px] w-full">
              <SeatBlock
                title="FLOOR — BLOCK A"
                range="SAR 340 – SAR 720"
                rows={FLOOR_ROWS}
                zone={zone}
                selectedIds={selectedIds}
                onToggle={toggleSeat}
              />
            </div>

            <div className="mt-2xl w-full">
              <SeatBlock
                title="MEZZANINE — BLOCK B"
                range="SAR 220 – SAR 380"
                rows={MEZZ_ROWS}
                zone={zone}
                selectedIds={selectedIds}
                onToggle={toggleSeat}
              />
            </div>

            <div className="mt-2xl w-full">
              <SeatBlock
                title="UPPER TIER — BLOCK C"
                range="SAR 140 – SAR 220"
                rows={UPPER_ROWS}
                zone={zone}
                selectedIds={selectedIds}
                onToggle={toggleSeat}
              />
            </div>

            <div className="mt-2xl grid w-full gap-sm md:grid-cols-3">
              {[
                { title: 'Standing pit', meta: 'Unreserved · SAR 240' },
                { title: 'Family lawn', meta: 'Seated on grass · SAR 120' },
                { title: 'Accessible bay', meta: 'Wheelchair + companion' },
              ].map((block) => (
                <button
                  key={block.title}
                  type="button"
                  className="rounded-[14px] border border-border-default bg-bg-page px-lg py-md text-left"
                >
                  <p className="text-[14px] font-semibold text-ink-primary">{block.title}</p>
                  <p className="mt-[2px] text-[12px] text-ink-secondary">{block.meta}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-lg border-t border-border-divider px-xl py-md">
          {[
            { className: 'border-border-default bg-surface-default', label: 'Available' },
            { className: 'border-transparent bg-brand-gradient', label: 'Selected' },
            { className: 'border-border-default bg-seat-sold', label: 'Sold' },
            {
              className:
                'border-neutral-scrollbar bg-[repeating-linear-gradient(135deg,var(--color-border-divider)_0_3px,var(--color-neutral-scrollbar)_3px_6px)]',
              label: 'Held by others',
            },
            { className: 'border-ink-brand bg-bg-tint-brand', label: 'Accessible' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-sm">
              <span className={cn('size-[14px] rounded-[4px] border', item.className)} />
              <span className="text-[12px] text-ink-secondary">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <aside className="flex w-full shrink-0 flex-col gap-md lg:w-[400px]">
        <div className="rounded-[20px] border border-border-default bg-surface-default p-[20px] shadow-[0px_18px_40px_-26px_rgba(25,16,8,0.3),0px_1px_2px_0px_rgba(25,16,8,0.04)]">
          <div className="flex items-baseline justify-between gap-md">
            <h2 className="text-[17px] font-semibold text-ink-primary">Your seats</h2>
            <p className="text-[13px] text-ink-secondary">
              {selected.length} of 6 selected
            </p>
          </div>

          <ul className="mt-lg flex flex-col gap-[12px]">
            {selected.map((seat) => (
              <li key={seat.id} className="flex items-start gap-[10px]">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-ink-primary">{seat.label}</p>
                  <p className="text-[12px] text-ink-secondary">{seat.category}</p>
                </div>
                <PriceDisplay context="row" className="text-[14px] font-semibold">
                  SAR {seat.price.toLocaleString('en-US')}
                </PriceDisplay>
                <button
                  type="button"
                  aria-label={`Remove ${seat.label}`}
                  className="text-ink-muted hover:text-ink-primary"
                  onClick={() =>
                    setSelected((current) => current.filter((item) => item.id !== seat.id))
                  }
                >
                  <CloseIcon size={13} />
                </button>
              </li>
            ))}
          </ul>

          <Divider tone="divider" className="my-lg" />

          <div className="flex flex-col gap-sm text-[14px]">
            <div className="flex justify-between">
              <span className="text-ink-secondary">Seats subtotal</span>
              <PriceDisplay context="row">SAR {subtotal.toLocaleString('en-US')}</PriceDisplay>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">Service fee</span>
              <PriceDisplay context="row">SAR {serviceFee.toLocaleString('en-US')}</PriceDisplay>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">VAT 15%</span>
              <PriceDisplay context="row">SAR {vat.toLocaleString('en-US')}</PriceDisplay>
            </div>
          </div>

          <div className="mt-md flex items-baseline justify-between border-t border-border-divider pt-md">
            <span className="text-[16px] font-semibold text-ink-primary">Total</span>
            <PriceDisplay context="stat">SAR {total.toLocaleString('en-US')}</PriceDisplay>
          </div>

          <Link
            to="/checkout"
            className={cn(
              'mt-lg inline-flex h-[52px] w-full items-center justify-center rounded-[26px]',
              'bg-brand-gradient text-[16px] font-semibold text-ink-inverse',
              'hover:bg-none hover:bg-brand-primary',
              selected.length === 0 && 'pointer-events-none opacity-50',
            )}
            aria-disabled={selected.length === 0}
          >
            Continue to payment · SAR {total.toLocaleString('en-US')}
          </Link>
          <p className="mt-md text-center text-[12px] leading-[1.5] text-ink-muted">
            Seats are held for 10 minutes. Maximum 6 per order.
          </p>
        </div>

        <div className="rounded-[18px] border border-border-default bg-surface-default p-[18px]">
          <h3 className="text-[15px] font-semibold text-ink-primary">Seat prices in this hall</h3>
          <ul className="mt-md flex flex-col gap-[10px]">
            {PRICE_TIERS.map((tier) => (
              <li key={tier.label} className="flex items-center gap-[10px]">
                <span className={cn('size-[10px] rounded-full', tier.tone)} />
                <span className="flex-1 text-[13px] text-ink-primary">{tier.label}</span>
                <span className="text-[12px] text-ink-muted">{tier.left}</span>
                <span className="text-[13px] font-semibold text-ink-primary">{tier.price}</span>
              </li>
            ))}
          </ul>
          <p className="mt-md text-[12px] leading-[1.5] text-ink-muted">
            Prices are per seat and vary by row within each zone.
          </p>
        </div>

        <div className="flex gap-[10px] rounded-[18px] border border-border-default bg-bg-warm px-lg py-md">
          <InfoIcon size={16} className="mt-[2px] shrink-0 text-ink-brand" />
          <p className="text-[13px] leading-[1.5] text-ink-primary">
            Need accessible seating? Choose an accessible bay on the map or message the
            organizer after checkout — companion seats are held at the same price.
          </p>
        </div>
      </aside>
    </div>
  )
}
