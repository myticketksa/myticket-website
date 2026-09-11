import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import { useGetEventsQuery } from '@/app/api/eventsApi'
import { useGetEventSeatsQuery, useHoldSeatsMutation } from '@/app/api/seatsApi'
import { useAppDispatch } from '@/app/hooks'
import { toastPushed } from '@/features/ui/uiSlice'
import { parsePureNumericIds } from '@/lib/api/formPayload'
import { resolveEventId } from '@/lib/api/mappers/events'
import { apiErrorMessage } from '@/lib/api/unwrap'

type SeatStatus =
  | 'available'
  | 'vip'
  | 'gold'
  | 'silver'
  | 'bronze'
  | 'sold'
  | 'held'
  | 'selected'
  | 'accessible'
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
  { tone: 'bg-brand-identity-end', label: 'Gold', left: '32 left', price: 'SAR 480+' },
  { tone: 'bg-ink-brand', label: 'Silver', left: '117 left', price: 'SAR 260+' },
  { tone: 'bg-ink-secondary', label: 'Bronze rear', left: '73 left', price: 'SAR 180+' },
] as const

const ZOOM_MIN = 75
const ZOOM_MAX = 150
const ZOOM_STEP = 25

/** Dense hall fixture — closer to Figma `207:7446` capacity with aisle gaps. */
function buildRow(row: string, pattern: SeatStatus[]): { id: string; status: SeatStatus }[] {
  return pattern.map((status, index) => ({
    id: `${row}${index + 1}`,
    status,
  }))
}

function patternFrom(
  length: number,
  base: SeatStatus,
  sold: number[],
  extras: Record<number, SeatStatus> = {},
): SeatStatus[] {
  return Array.from({ length }, (_, i) => {
    if (extras[i]) return extras[i]
    if (sold.includes(i)) return 'sold'
    return base
  })
}

function scatterSold(length: number, seed: number, every = 7): number[] {
  return Array.from({ length }, (_, i) => i).filter((i) => (i * 3 + seed) % every === 0)
}

const FLOOR_ROWS: { row: string; seats: ReturnType<typeof buildRow> }[] = [
  {
    row: 'A',
    seats: buildRow('A', patternFrom(36, 'vip', scatterSold(36, 1, 6), { 18: 'held' })),
  },
  {
    row: 'B',
    seats: buildRow('B', patternFrom(36, 'vip', scatterSold(36, 2, 6), { 10: 'held' })),
  },
  {
    row: 'C',
    seats: buildRow(
      'C',
      Array.from({ length: 38 }, (_, i) => {
        if (scatterSold(38, 3, 9).includes(i)) return 'sold'
        if (i < 8) return 'vip'
        return 'gold'
      }),
    ),
  },
  {
    row: 'D',
    seats: buildRow('D', patternFrom(38, 'gold', scatterSold(38, 4, 8), { 19: 'held' })),
  },
  {
    row: 'E',
    seats: buildRow('E', patternFrom(38, 'gold', scatterSold(38, 5, 8))),
  },
  {
    row: 'F',
    seats: buildRow('F', patternFrom(38, 'gold', scatterSold(38, 6, 7), { 12: 'accessible' })),
  },
  {
    row: 'G',
    seats: buildRow('G', patternFrom(40, 'gold', scatterSold(40, 7, 8))),
  },
  {
    row: 'H',
    seats: buildRow('H', patternFrom(40, 'gold', scatterSold(40, 8, 7), { 22: 'held' })),
  },
]

const MEZZ_ROWS = ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'].map((row, rowIndex) => ({
  row,
  seats: buildRow(
    row,
    Array.from({ length: 44 }, (_, i) => {
      if ((i + rowIndex * 3) % 7 === 0) return 'sold'
      if (i === 28 && row === 'J') return 'accessible'
      if (i === 11 && row === 'L') return 'held'
      if (i === 33 && row === 'N') return 'held'
      return 'silver'
    }),
  ),
}))

const UPPER_ROWS = ['Q', 'R', 'S', 'T', 'U', 'V'].map((row, rowIndex) => ({
  row,
  seats: buildRow(
    row,
    Array.from({ length: 48 }, (_, i) => {
      if ((i + rowIndex * 2) % 5 === 0) return 'sold'
      if (i === 20 && row === 'R') return 'accessible'
      return 'bronze'
    }),
  ),
}))

const ALL_SEAT_ROWS = [...FLOOR_ROWS, ...MEZZ_ROWS, ...UPPER_ROWS]

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

function seatMeta(status: SeatStatus): { price: number; category: string } {
  if (status === 'vip') return { price: 680, category: 'VIP · Floor – Block A' }
  if (status === 'silver') return { price: 260, category: 'Silver · Mezzanine – Block B' }
  if (status === 'bronze') return { price: 180, category: 'Bronze · Upper Tier – Block C' }
  return { price: 520, category: 'Gold · Floor – Block A' }
}

function seatClass(status: SeatStatus) {
  switch (status) {
    case 'vip':
      return 'border-seat-vip bg-seat-vip-tint'
    case 'gold':
      return 'border-ink-brand bg-bg-tint-brand'
    case 'silver':
      return 'border-seat-silver bg-seat-silver-tint'
    case 'bronze':
      return 'border-ink-secondary bg-border-divider'
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
        'flex size-[15px] items-center justify-center rounded-[4px] border',
        seatClass(status),
        !interactive && 'cursor-not-allowed',
      )}
    >
      {status === 'selected' && <CheckIcon size={9} className="text-ink-inverse" />}
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
      <div className="mt-md flex flex-col items-center gap-[5px]">
        {rows.map(({ row, seats }) => {
          const aisle = Math.floor(seats.length / 2)
          return (
            <div key={row} className="flex items-center gap-[8px]">
              <span className="w-[16px] text-right text-[10px] font-semibold text-ink-muted">
                {row}
              </span>
              <div className="flex gap-[3px]">
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
                      className={cn(
                        !zoneMatch && 'opacity-30',
                        index === aisle && 'ml-[10px]',
                      )}
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
              <span className="w-[16px] text-[10px] font-semibold text-ink-muted">{row}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Seat Selection — Figma `207:7446`. Purchase header comes from `PurchaseLayout`.
 */
export function SeatSelectionPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { slug } = useParams()
  const [zone, setZone] = useState<Zone>('all')
  const [zoom, setZoom] = useState(100)
  const [selected, setSelected] = useState<SelectedSeat[]>(INITIAL_SELECTED)
  const [holding, setHolding] = useState(false)
  const selectedIds = useMemo(() => new Set(selected.map((seat) => seat.id)), [selected])

  const { data: apiEvents } = useGetEventsQuery()
  const [holdSeats] = useHoldSeatsMutation()
  const resolvedEventId = useMemo(
    () => resolveEventId(apiEvents, slug ?? '') ?? (/^\d+$/.test(slug ?? '') ? slug : undefined),
    [apiEvents, slug],
  )
  /** Prefetch seat inventory when API is up; map UI stays fixture until response shape is probed. */
  useGetEventSeatsQuery(resolvedEventId!, { skip: !resolvedEventId })

  const subtotal = selected.reduce((sum, seat) => sum + seat.price, 0)
  const serviceFee = Math.round(subtotal * 0.05)
  const vat = Math.round((subtotal + serviceFee) * 0.15)
  const total = subtotal + serviceFee + vat

  /**
   * Soft hold: call API only when seat ids are pure numeric + ticketId is known.
   * Fixture labels like `C11` stay local mock so checkout still works offline.
   */
  async function continueToCheckout() {
    if (resolvedEventId) sessionStorage.setItem('myticket.eventId', resolvedEventId)
    else if (slug) sessionStorage.setItem('myticket.eventId', slug)

    const storedTicketId = sessionStorage.getItem('myticket.ticketId')
    const ticketId =
      storedTicketId && /^\d+$/.test(storedTicketId) ? Number(storedTicketId) : undefined
    const numericSeatIds = parsePureNumericIds(selected.map((seat) => seat.id))

    let holdId: string | number | undefined
    let heldSeatIds: Array<string | number> = selected.map((seat) => seat.id)

    if (resolvedEventId && ticketId && numericSeatIds.length === selected.length) {
      setHolding(true)
      try {
        const held = await holdSeats({
          eventId: resolvedEventId,
          seatIds: numericSeatIds,
          ticketId,
        }).unwrap()
        holdId = (held.holdId ?? held.hold_id ?? held.id) as string | number | undefined
        heldSeatIds = numericSeatIds
      } catch (error) {
        dispatch(
          toastPushed(
            'neutral',
            apiErrorMessage(error, 'Seat hold unavailable — continuing with local hold'),
          ),
        )
      } finally {
        setHolding(false)
      }
    }

    sessionStorage.setItem(
      'myticket.mockHold',
      JSON.stringify({
        seatIds: heldSeatIds,
        ticketId,
        holdId,
        total,
        heldAt: Date.now(),
      }),
    )
    if (ticketId) sessionStorage.setItem('myticket.ticketId', String(ticketId))
    navigate('/checkout')
  }

  function toggleSeat(id: string, row: string, number: number, status: SeatStatus) {
    if (status === 'sold' || status === 'held') return

    setSelected((current) => {
      if (current.some((seat) => seat.id === id)) {
        return current.filter((seat) => seat.id !== id)
      }
      if (current.length >= 6) return current

      const { price, category } = seatMeta(status === 'selected' ? 'gold' : status)

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

  function pickBestAvailable() {
    const preferred: SeatStatus[] =
      zone === 'all' ? ['gold', 'vip', 'silver', 'bronze'] : [zone]
    const need = 2
    const picks: SelectedSeat[] = []

    for (const status of preferred) {
      for (const { row, seats } of ALL_SEAT_ROWS) {
        for (let i = 0; i < seats.length; i++) {
          const run: { id: string; index: number; status: SeatStatus }[] = []
          for (let j = i; j < seats.length && run.length < need; j++) {
            const seat = seats[j]
            if (seat.status !== status) break
            run.push({ id: seat.id, index: j + 1, status: seat.status })
          }
          if (run.length === need) {
            for (const seat of run) {
              const { price, category } = seatMeta(seat.status)
              picks.push({
                id: seat.id,
                label: `Row ${row}, seat ${seat.index}`,
                category,
                price,
              })
            }
            setSelected(picks)
            return
          }
        }
      }
    }
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
              onClick={pickBestAvailable}
            >
              Pick best available
            </Button>
            <div className="flex items-center gap-[4px] rounded-[17px] border border-border-default p-[4px]">
              <button
                type="button"
                className="flex h-[26px] w-[28px] items-center justify-center rounded-[13px] text-ink-primary disabled:cursor-not-allowed disabled:text-ink-disabled"
                aria-label="Zoom out"
                disabled={zoom <= ZOOM_MIN}
                onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
              >
                <MinusIcon size={15} />
              </button>
              <span className="w-[34px] text-center text-[12px] font-semibold text-ink-secondary">
                {zoom}%
              </span>
              <button
                type="button"
                className="flex h-[26px] w-[28px] items-center justify-center rounded-[13px] text-ink-primary disabled:cursor-not-allowed disabled:text-ink-disabled"
                aria-label="Zoom in"
                disabled={zoom >= ZOOM_MAX}
                onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
              >
                <PlusIcon size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-auto bg-gradient-to-b from-bg-page via-surface-default via-[55%] to-surface-default px-2xl pt-[30px] pb-[26px]">
          <div
            className="mx-auto flex w-full max-w-[980px] origin-top flex-col items-center transition-transform duration-normal ease-standard"
            style={{ transform: `scale(${zoom / 100})` }}
          >
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

          <Button
            type="button"
            size="lg"
            className="mt-lg h-[52px] w-full rounded-[26px] text-[16px] font-semibold"
            disabled={holding || selected.length === 0}
            onClick={() => void continueToCheckout()}
          >
            {holding
              ? 'Holding seats…'
              : `Continue to payment · SAR ${total.toLocaleString('en-US')}`}
          </Button>
          <p className="mt-md text-center text-[12px] leading-[1.5] text-ink-muted">
            Seats are held for 10 minutes. Maximum 6 per order.
          </p>
        </div>

        <div className="rounded-[18px] border border-border-default bg-surface-default p-[18px]">
          <h3 className="text-[14px] font-semibold text-ink-primary">Seat prices in this hall</h3>
          <ul className="mt-md flex flex-col gap-[10px]">
            {PRICE_TIERS.map((tier) => (
              <li key={tier.label} className="flex items-center gap-[10px]">
                <span className={cn('size-[13px] rounded-[4px]', tier.tone)} />
                <span className="flex-1 text-[13px] text-ink-primary">{tier.label}</span>
                <span className="text-[13px] text-ink-secondary">{tier.left}</span>
                <span className="text-[13px] font-semibold text-ink-primary">{tier.price}</span>
              </li>
            ))}
          </ul>
          <p className="mt-md border-t border-border-divider pt-md text-[12px] leading-[1.5] text-ink-secondary">
            Prices are per seat and vary by row — front rows cost more than the same tier further
            back.
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
