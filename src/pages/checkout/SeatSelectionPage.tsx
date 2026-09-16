import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { EmptyState } from '@/components/feedback'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useGetEventsQuery } from '@/app/api/eventsApi'
import {
  useGetEventSeatsQuery,
  useHoldSeatsMutation,
  useReleaseHoldMutation,
} from '@/app/api/seatsApi'
import { useAppDispatch } from '@/app/hooks'
import { toastPushed } from '@/features/ui/uiSlice'
import { parsePureNumericIds } from '@/lib/api/formPayload'
import { firstTicketTypeId } from '@/lib/api/locale'
import {
  listTicketTypes,
  mapApiEventToCard,
  resolveEventFromList,
  resolveEventId,
  resolveSeatingType,
} from '@/lib/api/mappers/events'
import { mapApiSeatsToRows, type SeatMapStatus } from '@/lib/api/mappers/seats'
import { apiErrorMessage } from '@/lib/api/unwrap'
import { writeFreeSeatingSession, writeHoldSession } from '@/lib/purchase/holdSession'

type SeatStatus = SeatMapStatus | 'selected'
type Zone = 'all' | 'vip' | 'gold' | 'silver' | 'bronze'

interface SelectedSeat {
  id: string
  label: string
  category: string
  price: number
}

const ZONE_IDS: Zone[] = ['all', 'vip', 'gold', 'silver', 'bronze']

const PRICE_TIER_DEFS = [
  { tone: 'bg-seat-vip', key: 'vip' as const, left: 34, price: 'SAR 680+' },
  { tone: 'bg-brand-identity-end', key: 'gold' as const, left: 32, price: 'SAR 480+' },
  { tone: 'bg-ink-brand', key: 'silver' as const, left: 117, price: 'SAR 260+' },
  { tone: 'bg-ink-secondary', key: 'bronze' as const, left: 73, price: 'SAR 180+' },
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
              <span className="w-[16px] text-end text-[10px] font-semibold text-ink-muted">
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
                        index === aisle && 'ms-[10px]',
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
  const { t } = useTranslation('checkout')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { slug } = useParams()
  const [zone, setZone] = useState<Zone>('all')
  const [zoom, setZoom] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches ? 70 : 100,
  )
  const [selected, setSelected] = useState<SelectedSeat[]>([])
  const [holding, setHolding] = useState(false)
  const selectedIds = useMemo(() => new Set(selected.map((seat) => seat.id)), [selected])
  const continuingRef = useRef(false)

  const { data: eventsResult, isLoading: eventsLoading } = useGetEventsQuery()
  const apiEvents = eventsResult?.items
  const [holdSeats] = useHoldSeatsMutation()
  const [releaseHold] = useReleaseHoldMutation()
  const resolvedEventId = useMemo(
    () => resolveEventId(apiEvents, slug ?? '') ?? (/^\d+$/.test(slug ?? '') ? slug : undefined),
    [apiEvents, slug],
  )

  // Free seating never uses the seat map — bounce to checkout or event detail.
  useEffect(() => {
    const event = resolveEventFromList(apiEvents, slug ?? '')
    if (!event || !slug) return
    if (resolveSeatingType(event) !== 'free') return

    const mapped = mapApiEventToCard(event)
    if (mapped.isFree) {
      navigate(`/events/${slug}`, { replace: true })
      return
    }

    const ticket = listTicketTypes(event)[0]
    const ticketId = ticket?.id ?? mapped.ticketTypeId
    const eventId = resolvedEventId ?? (mapped.id ? String(mapped.id) : undefined)
    if (!eventId || !ticketId) {
      navigate(`/events/${slug}`, { replace: true })
      return
    }

    writeFreeSeatingSession({
      eventId,
      ticketId,
      quantity: 1,
      unitPrice: ticket?.price ?? 0,
      slug,
      label: ticket?.name,
    })
    sessionStorage.setItem('myticket.ticketId', String(ticketId))
    sessionStorage.setItem('myticket.eventId', eventId)
    sessionStorage.setItem('myticket.eventSlug', slug)
    navigate('/checkout', { replace: true })
  }, [apiEvents, navigate, resolvedEventId, slug])

  const {
    data: apiSeats,
    isLoading: seatsLoading,
    isFetching: seatsFetching,
  } = useGetEventSeatsQuery(resolvedEventId!, {
    skip: !resolvedEventId,
  })

  const liveRows = useMemo(() => mapApiSeatsToRows(apiSeats ?? []), [apiSeats])
  const usingLiveMap = Boolean(liveRows && liveRows.length > 0)
  const waitingForSeats =
    eventsLoading ||
    (!resolvedEventId && apiEvents === undefined) ||
    (Boolean(resolvedEventId) && (seatsLoading || (seatsFetching && !usingLiveMap)))
  const seatsUnavailable = !waitingForSeats && !usingLiveMap

  const floorRows = usingLiveMap
    ? liveRows!.slice(0, Math.ceil(liveRows!.length / 3))
    : FLOOR_ROWS
  const mezzRows = usingLiveMap
    ? liveRows!.slice(
        Math.ceil(liveRows!.length / 3),
        Math.ceil((liveRows!.length * 2) / 3),
      )
    : MEZZ_ROWS
  const upperRows = usingLiveMap
    ? liveRows!.slice(Math.ceil((liveRows!.length * 2) / 3))
    : UPPER_ROWS

  useEffect(() => {
    setSelected([])
  }, [usingLiveMap, resolvedEventId])

  useEffect(() => {
    const eventRecord = resolveEventFromList(apiEvents, slug ?? '')
    const ticketTypeId = firstTicketTypeId(eventRecord)
    if (ticketTypeId) sessionStorage.setItem('myticket.ticketId', String(ticketTypeId))
    if (resolvedEventId) sessionStorage.setItem('myticket.eventId', String(resolvedEventId))
  }, [apiEvents, resolvedEventId, slug])

  // Release only when the tab is closed / unloaded — not on React Strict Mode remounts
  // or when continuing to checkout (those unmounts used to wipe a valid holdId).
  useEffect(() => {
    const releaseOnUnload = () => {
      if (continuingRef.current) return
      try {
        const mock = JSON.parse(sessionStorage.getItem('myticket.mockHold') || 'null') as {
          holdId?: string
          eventId?: string
        } | null
        const eventId = mock?.eventId ?? resolvedEventId
        if (mock?.holdId && eventId) {
          void releaseHold({ eventId, holdId: String(mock.holdId) })
          sessionStorage.removeItem('myticket.mockHold')
        }
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('pagehide', releaseOnUnload)
    return () => window.removeEventListener('pagehide', releaseOnUnload)
  }, [releaseHold, resolvedEventId])

  const subtotal = selected.reduce((sum, seat) => sum + seat.price, 0)
  const serviceFee = Math.round(subtotal * 0.05)
  const vat = Math.round((subtotal + serviceFee) * 0.15)
  const total = subtotal + serviceFee + vat

  /**
   * Seated checkout requires a real API soft-hold (`holdId` + numeric `seatIds`).
   * Fixture labels like `C11` cannot create an order on the live API.
   */
  async function continueToCheckout() {
    if (selected.length === 0 || waitingForSeats || seatsUnavailable) return

    if (resolvedEventId) sessionStorage.setItem('myticket.eventId', resolvedEventId)
    else if (slug) sessionStorage.setItem('myticket.eventId', slug)

    const eventRecord = resolveEventFromList(apiEvents, slug ?? '')
    const storedTicketId = sessionStorage.getItem('myticket.ticketId')
    const ticketId =
      (storedTicketId && /^\d+$/.test(storedTicketId) ? Number(storedTicketId) : undefined) ??
      firstTicketTypeId(eventRecord)
    const numericSeatIds = parsePureNumericIds(selected.map((seat) => seat.id))

    if (!usingLiveMap || numericSeatIds.length !== selected.length) {
      dispatch(toastPushed('error', t('seats.liveRequired')))
      return
    }

    if (!resolvedEventId || !ticketId) {
      dispatch(toastPushed('error', t('seats.ticketMissing')))
      return
    }

    setHolding(true)
    try {
      const held = await holdSeats({
        eventId: resolvedEventId,
        seatIds: numericSeatIds,
        ticketId,
      }).unwrap()
      const holdId = held.holdId ?? held.hold_id ?? held.id
      if (holdId == null || String(holdId).trim() === '') {
        throw new Error('Hold id missing from seat hold response')
      }

      continuingRef.current = true
      writeHoldSession({
        seatIds: numericSeatIds,
        seats: selected,
        ticketId,
        holdId: String(holdId),
        eventId: resolvedEventId,
        total,
        subtotal,
        serviceFee,
        vat,
        heldAt: Date.now(),
        slug: slug ?? undefined,
      })
      sessionStorage.setItem('myticket.ticketId', String(ticketId))
      navigate('/checkout')
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('seats.holdFailed'))))
    } finally {
      setHolding(false)
    }
  }

  function toggleSeat(id: string, row: string, number: number, status: SeatStatus) {
    if (!usingLiveMap || status === 'sold' || status === 'held') return

    setSelected((current) => {
      if (current.some((seat) => seat.id === id)) {
        return current.filter((seat) => seat.id !== id)
      }
      if (current.length >= 6) return current

      const liveSeat = liveRows
        ?.flatMap((r) => r.seats)
        .find((seat) => seat.id === id)
      const meta = seatMeta(status === 'selected' ? 'gold' : status)

      return [
        ...current,
        {
          id,
          label: t('seats.rowSeat', { row, number }),
          category: liveSeat?.category ?? meta.category,
          price: liveSeat?.price ?? meta.price,
        },
      ]
    })
  }

  function pickBestAvailable() {
    if (!usingLiveMap) return
    const preferred: SeatStatus[] =
      zone === 'all' ? ['gold', 'vip', 'silver', 'bronze'] : [zone]
    const need = 2
    const picks: SelectedSeat[] = []
    const sourceRows = usingLiveMap
      ? [...floorRows, ...mezzRows, ...upperRows]
      : ALL_SEAT_ROWS

    for (const status of preferred) {
      for (const { row, seats } of sourceRows) {
        for (let i = 0; i < seats.length; i++) {
          const run: { id: string; index: number; status: SeatStatus }[] = []
          for (let j = i; j < seats.length && run.length < need; j++) {
            const seat = seats[j]
            if (seat.status !== status) break
            run.push({ id: seat.id, index: j + 1, status: seat.status })
          }
          if (run.length === need) {
            for (const seat of run) {
              const liveSeat = liveRows
                ?.flatMap((r) => r.seats)
                .find((item) => item.id === seat.id)
              const meta = seatMeta(seat.status)
              picks.push({
                id: seat.id,
                label: t('seats.rowSeat', { row, number: seat.index }),
                category: liveSeat?.category ?? meta.category,
                price: liveSeat?.price ?? meta.price,
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
            <p className="text-[15px] font-semibold text-ink-primary">{t('seats.hall')}</p>
            {usingLiveMap ? (
              <div className="flex flex-wrap gap-sm">
                {ZONE_IDS.map((id) => (
                  <FilterChip
                    key={id}
                    selected={zone === id}
                    onClick={() => setZone(id)}
                    className="h-8 rounded-pill px-md text-[13px] font-semibold"
                  >
                    {t(`seats.zones.${id}`)}
                  </FilterChip>
                ))}
              </div>
            ) : null}
          </div>
          {usingLiveMap ? (
            <div className="flex items-center gap-sm">
              <Button
                size="sm"
                variant="secondary"
                icon={<SparkleIcon size={16} />}
                className="h-[34px] rounded-[17px] bg-bg-page px-[14px]"
                onClick={pickBestAvailable}
                disabled={waitingForSeats}
              >
                {t('seats.pickBest')}
              </Button>
              <div className="flex items-center gap-[4px] rounded-[17px] border border-border-default p-[4px]">
                <button
                  type="button"
                  className="flex h-[26px] w-[28px] items-center justify-center rounded-[13px] text-ink-primary disabled:cursor-not-allowed disabled:text-ink-disabled"
                  aria-label={t('seats.zoomOut')}
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
                  aria-label={t('seats.zoomIn')}
                  disabled={zoom >= ZOOM_MAX}
                  onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
                >
                  <PlusIcon size={15} />
                </button>
              </div>
            </div>
          ) : waitingForSeats ? (
            <p className="text-[13px] font-semibold text-ink-secondary">{t('seats.loading')}</p>
          ) : null}
        </div>

        <div className="overflow-auto bg-gradient-to-b from-bg-page via-surface-default via-[55%] to-surface-default px-md pt-[30px] pb-[26px] sm:px-2xl">
          {waitingForSeats ? (
            <p className="py-3xl text-center text-[14px] font-semibold text-ink-secondary">
              {t('seats.loading')}
            </p>
          ) : seatsUnavailable ? (
            <EmptyState
              variant="gated"
              className="mx-auto py-3xl"
              title={t('seats.unavailableTitle')}
              body={t('seats.unavailableBody')}
              ctaLabel={t('seats.backToEvent')}
              onCtaClick={() => navigate(slug ? `/events/${slug}` : '/events')}
            />
          ) : (
            <>
              <p className="mb-md text-center text-[12px] text-ink-muted lg:hidden">
                {t('seats.mapHint')}
              </p>
              <div
                className="mx-auto flex w-full max-w-[980px] origin-top flex-col items-center transition-transform duration-normal ease-standard"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <div className="flex h-[46px] w-full items-center justify-center rounded-b-[46px] bg-surface-inverse">
                  <p className="text-[13px] font-bold tracking-[3.64px] text-bg-page">{t('seats.stage')}</p>
                </div>

                <div className="mt-[34px] w-full">
                  <SeatBlock
                    title={t('seats.blocks.floor')}
                    range={t('seats.blocks.floorRange')}
                    rows={floorRows}
                    zone={zone}
                    selectedIds={selectedIds}
                    onToggle={toggleSeat}
                  />
                </div>

                <div className="mt-2xl w-full">
                  <SeatBlock
                    title={t('seats.blocks.mezzanine')}
                    range={t('seats.blocks.mezzRange')}
                    rows={mezzRows}
                    zone={zone}
                    selectedIds={selectedIds}
                    onToggle={toggleSeat}
                  />
                </div>

                <div className="mt-2xl w-full">
                  <SeatBlock
                    title={t('seats.blocks.upper')}
                    range={t('seats.blocks.upperRange')}
                    rows={upperRows}
                    zone={zone}
                    selectedIds={selectedIds}
                    onToggle={toggleSeat}
                  />
                </div>

                <div className="mt-2xl grid w-full gap-sm md:grid-cols-3">
                  {[
                    { title: t('seats.extras.standingPit'), meta: t('seats.extras.standingPitMeta') },
                    { title: t('seats.extras.familyLawn'), meta: t('seats.extras.familyLawnMeta') },
                    {
                      title: t('seats.extras.accessibleBay'),
                      meta: t('seats.extras.accessibleBayMeta'),
                    },
                  ].map((block) => (
                    <button
                      key={block.title}
                      type="button"
                      className="rounded-[14px] border border-border-default bg-bg-page px-lg py-md text-start"
                    >
                      <p className="text-[14px] font-semibold text-ink-primary">{block.title}</p>
                      <p className="mt-[2px] text-[12px] text-ink-secondary">{block.meta}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-lg border-t border-border-divider px-xl py-md">
          {[
            { className: 'border-border-default bg-surface-default', label: t('seats.legend.available') },
            { className: 'border-transparent bg-brand-gradient', label: t('seats.legend.selected') },
            { className: 'border-border-default bg-seat-sold', label: t('seats.legend.sold') },
            {
              className:
                'border-neutral-scrollbar bg-[repeating-linear-gradient(135deg,var(--color-border-divider)_0_3px,var(--color-neutral-scrollbar)_3px_6px)]',
              label: t('seats.legend.held'),
            },
            { className: 'border-ink-brand bg-bg-tint-brand', label: t('seats.legend.accessible') },
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
            <h2 className="text-[17px] font-semibold text-ink-primary">{t('seats.yourSeats')}</h2>
            <p className="text-[13px] text-ink-secondary">
              {t('seats.selectedOf', { count: selected.length, max: 6 })}
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
                  aria-label={t('seats.removeSeat', { label: seat.label })}
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
              <span className="text-ink-secondary">{t('seats.subtotal')}</span>
              <PriceDisplay context="row">SAR {subtotal.toLocaleString('en-US')}</PriceDisplay>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">{t('seats.serviceFee')}</span>
              <PriceDisplay context="row">SAR {serviceFee.toLocaleString('en-US')}</PriceDisplay>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">{t('seats.vat')}</span>
              <PriceDisplay context="row">SAR {vat.toLocaleString('en-US')}</PriceDisplay>
            </div>
          </div>

          <div className="mt-md flex items-baseline justify-between border-t border-border-divider pt-md">
            <span className="text-[16px] font-semibold text-ink-primary">{t('seats.total')}</span>
            <PriceDisplay context="stat">SAR {total.toLocaleString('en-US')}</PriceDisplay>
          </div>

          <Button
            type="button"
            size="lg"
            className="mt-lg h-[52px] w-full rounded-[26px] text-[16px] font-semibold"
            disabled={
              holding ||
              waitingForSeats ||
              seatsUnavailable ||
              selected.length === 0 ||
              !usingLiveMap
            }
            onClick={() => void continueToCheckout()}
          >
            {waitingForSeats
              ? t('seats.loading')
              : holding
                ? t('seats.holding')
                : t('seats.continuePayment', {
                    amount: `SAR ${total.toLocaleString('en-US')}`,
                  })}
          </Button>
          <p className="mt-md text-center text-[12px] leading-[1.5] text-ink-muted">
            {seatsUnavailable ? t('seats.needLive') : t('seats.holdNote')}
          </p>
        </div>

        <div className="rounded-[18px] border border-border-default bg-surface-default p-[18px]">
          <h3 className="text-[14px] font-semibold text-ink-primary">{t('seats.pricesTitle')}</h3>
          <ul className="mt-md flex flex-col gap-[10px]">
            {PRICE_TIER_DEFS.map((tier) => (
              <li key={tier.key} className="flex items-center gap-[10px]">
                <span className={cn('size-[13px] rounded-[4px]', tier.tone)} />
                <span className="flex-1 text-[13px] text-ink-primary">
                  {t(`seats.tiers.${tier.key}`)}
                </span>
                <span className="text-[13px] text-ink-secondary">
                  {t('seats.tiers.left', { count: tier.left })}
                </span>
                <span className="text-[13px] font-semibold text-ink-primary">{tier.price}</span>
              </li>
            ))}
          </ul>
          <p className="mt-md border-t border-border-divider pt-md text-[12px] leading-[1.5] text-ink-secondary">
            {t('seats.pricesNote')}
          </p>
        </div>

        <div className="flex gap-[10px] rounded-[18px] border border-border-default bg-bg-warm px-lg py-md">
          <InfoIcon size={16} className="mt-[2px] shrink-0 text-ink-brand" />
          <p className="text-[13px] leading-[1.5] text-ink-primary">{t('seats.accessibleNote')}</p>
        </div>
      </aside>
    </div>
  )
}
