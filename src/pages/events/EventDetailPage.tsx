import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCreateOrderMutation, usePayOrderMutation } from '@/app/api/ordersApi'
import { useGetEventDetailsQuery, useGetEventsQuery } from '@/app/api/eventsApi'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAuthUser } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { apiErrorMessage } from '@/lib/api/unwrap'
import { useRequireAuth } from '@/lib/auth/useRequireAuth'
import { useEventFavorites } from '@/lib/favorites/useEventFavorites'
import { firstTicketTypeId, formatMoneySar, localizedString } from '@/lib/api/locale'
import {
  listTicketTypes,
  mapApiEventToCard,
  resolveEventFromList,
  resolveEventId,
  resolveSeatingType,
} from '@/lib/api/mappers/events'
import { writeFreeSeatingSession } from '@/lib/purchase/holdSession'
import { Avatar } from '@/components/data-display'
import {
  ArrowUpRightIcon,
  CalendarIcon,
  HeartGlyphIcon,
  StarFillIcon,
} from '@/components/icons'
import { FadeUp } from '@/components/motion'
import {
  Breadcrumbs,
  DetailSectionTab,
  DetailSectionTabs,
} from '@/components/navigation'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'
import {
  CATALOG_EVENTS,
  DetailGallery,
  EVENT_DETAIL,
  EVENT_DETAIL_GALLERY,
  EVENT_DETAIL_VENUE_MAP,
  SimilarSection,
  slugify,
  StickyCtaAssurances,
  StickyCtaCard,
  type TicketTier,
} from '@/pages/_guest'

/**
 * Figma `207:4797` tab rail — About · Line-up · Venue · Reviews · Policies.
 * Organizer sits between Venue and Reviews in the continuous article (no tab).
 */
const TABS = ['About', 'Line-up', 'Venue', 'Reviews', 'Policies'] as const
type Tab = (typeof TABS)[number]

const TAB_IDS: Record<Tab, string> = {
  About: 'about',
  'Line-up': 'line-up',
  Venue: 'venue',
  Reviews: 'reviews',
  Policies: 'policies',
}

const TAB_LABEL_KEYS: Record<Tab, string> = {
  About: 'detail.about',
  'Line-up': 'detail.lineUp',
  Venue: 'detail.venue',
  Reviews: 'detail.reviews',
  Policies: 'detail.policies',
}

const REVIEWS = [
  {
    initials: 'MA',
    name: 'Mohammed A.',
    date: 'Reviewed 12 March 2026',
    rating: '5.0',
    body: 'Sound was excellent even at the back of the field. Entry through Gate 3 took five minutes with the app ticket.',
  },
  {
    initials: 'HS',
    name: 'Hala S.',
    date: 'Reviewed 9 March 2026',
    rating: '4.5',
    body: 'Great atmosphere and the family lawn was genuinely comfortable. Food queues got long around 21:00.',
  },
  {
    initials: 'KR',
    name: 'Khalid R.',
    date: 'Reviewed 2 March 2026',
    rating: '4.0',
    body: "Gold pit is worth it if you want to be close, but arrive by 19:00 or you'll be behind the early crowd.",
  },
] as const

const POLICIES = [
  {
    label: 'Refunds',
    body: 'Full refund up to 72 hours before the event. No refunds after that, but tickets can be listed on the resale auction.',
  },
  {
    label: 'Transfers',
    body: 'Free transfer to another MyTicket account up to 2 hours before doors.',
  },
  {
    label: 'Age',
    body: 'All ages. Under 12s must be accompanied and are seated on the eastern lawn.',
  },
  {
    label: 'Prohibited',
    body: 'Professional cameras, outside food and drink, and any glass containers.',
  },
] as const

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=King+Abdullah+Park,+Al+Malaz,+Riyadh+12836'

function pickDetailString(record: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  if (!record) return undefined
  for (const key of keys) {
    const text = localizedString(record[key])
    if (text) return text
  }
  return undefined
}

/** Event detail — Figma `207:4797` continuous article + scroll-spy tabs. */
export function EventDetailPage() {
  const { t } = useTranslation(['catalog', 'common'])
  const { slug } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const { requireAuth } = useRequireAuth()
  const [createOrder, createState] = useCreateOrderMutation()
  const [payOrder, payState] = usePayOrderMutation()
  const slugOrId = slug ?? ''
  const [tab, setTab] = useState<Tab>('About')
  const scrollingToRef = useRef<string | null>(null)
  const { isFavourite, toggleFavourite } = useEventFavorites()
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [ticketQty, setTicketQty] = useState(1)

  const { data: eventsResult } = useGetEventsQuery()
  const apiEvents = eventsResult?.items

  const catalog = useMemo(() => {
    if (apiEvents && apiEvents.length > 0) {
      return apiEvents.map(mapApiEventToCard)
    }
    return CATALOG_EVENTS.map((event) => ({ ...event, slug: slugify(event.title) }))
  }, [apiEvents])

  const resolvedId = useMemo(
    () => resolveEventId(apiEvents, slugOrId),
    [apiEvents, slugOrId],
  )

  const { data: apiDetail } = useGetEventDetailsQuery(resolvedId!, {
    skip: !resolvedId,
  })

  const isSaved = isFavourite(resolvedId)

  async function handleSave() {
    if (!resolvedId) {
      dispatch(toastPushed('error', t('detail.saveUnavailable')))
      return
    }
    try {
      const ok = await toggleFavourite(resolvedId)
      if (ok) {
        dispatch(
          toastPushed('success', isSaved ? t('detail.removedSaved') : t('detail.saved')),
        )
      }
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('detail.saveError'))))
    }
  }

  const listCard = useMemo(() => {
    const fromCatalog = catalog.find(
      (e) => e.slug === slugOrId || slugify(e.title) === slugOrId,
    )
    if (fromCatalog) return fromCatalog
    if (apiEvents?.length) {
      const raw = resolveEventFromList(apiEvents, slugOrId)
      return raw ? mapApiEventToCard(raw) : undefined
    }
    return undefined
  }, [apiEvents, catalog, slugOrId])

  const detailCard = useMemo(() => {
    if (apiDetail && Object.keys(apiDetail).length > 0) {
      return mapApiEventToCard(apiDetail)
    }
    return undefined
  }, [apiDetail])

  const display = useMemo(
    () => ({
      title: detailCard?.title ?? listCard?.title ?? EVENT_DETAIL.title,
      category: detailCard?.category ?? listCard?.category ?? EVENT_DETAIL.category,
      flag:
        detailCard?.flag ??
        (listCard && 'flag' in listCard ? listCard.flag : undefined) ??
        EVENT_DETAIL.flag,
      rating:
        pickDetailString(apiDetail, ['rating_label', 'reviews_summary']) ??
        (detailCard?.rating && detailCard.rating !== '—'
          ? `${detailCard.rating} reviews`
          : listCard?.rating
            ? `${listCard.rating} reviews`
            : EVENT_DETAIL.rating),
      when:
        pickDetailString(apiDetail, ['when', 'date_label', 'starts_at', 'datetime']) ??
        listCard?.date ??
        EVENT_DETAIL.when,
      venue:
        detailCard?.venue ||
        listCard?.venue ||
        EVENT_DETAIL.venue,
      attendance:
        detailCard?.attendance ||
        listCard?.attendance ||
        EVENT_DETAIL.attendance,
      fromPrice: detailCard?.price ?? listCard?.price ?? EVENT_DETAIL.fromPrice,
    }),
    [apiDetail, detailCard, listCard],
  )

  const title = display.title

  useEffect(() => {
    const ticketTypeId =
      firstTicketTypeId(apiDetail) ??
      (listCard && 'ticketTypeId' in listCard ? listCard.ticketTypeId : undefined)
    if (ticketTypeId) sessionStorage.setItem('myticket.ticketId', String(ticketTypeId))
    if (resolvedId) sessionStorage.setItem('myticket.eventId', String(resolvedId))
  }, [apiDetail, listCard, resolvedId])

  const eventSource = apiDetail && Object.keys(apiDetail).length > 0 ? apiDetail : undefined
  const seatingType = resolveSeatingType(
    eventSource ?? resolveEventFromList(apiEvents, slugOrId),
  )
  const isFreeEvent = Boolean(
    detailCard?.isFree ??
      (listCard && 'isFree' in listCard ? listCard.isFree : undefined) ??
      (eventSource?.isFree === true || eventSource?.is_free === true),
  )
  const apiTicketTypes = useMemo(
    () => listTicketTypes(eventSource ?? resolveEventFromList(apiEvents, slugOrId)),
    [apiEvents, eventSource, slugOrId],
  )

  useEffect(() => {
    if (apiTicketTypes.length === 0) return
    setSelectedTicketId((current) => {
      if (current != null && apiTicketTypes.some((tier) => tier.id === current)) {
        return current
      }
      return apiTicketTypes[0]!.id
    })
    if (apiTicketTypes.length === 1) setTicketQty(1)
  }, [apiTicketTypes])

  const selectedTicket =
    apiTicketTypes.find((tier) => tier.id === selectedTicketId) ?? apiTicketTypes[0]

  const freeSeatingTiers: TicketTier[] | undefined = useMemo(() => {
    if (seatingType !== 'free' || apiTicketTypes.length === 0) return undefined
    return apiTicketTypes.map((tier) => ({
      name: tier.name,
      detail: tier.detail || (seatingType === 'free' ? 'Free seating' : ''),
      price: tier.price <= 0 ? 'Free' : formatMoneySar(tier.price),
      left: '',
      maxLabel: t('stickyCta.maxPerOrder'),
      selected: tier.id === selectedTicket?.id,
      qty: tier.id === selectedTicket?.id ? ticketQty : 0,
    }))
  }, [apiTicketTypes, seatingType, selectedTicket?.id, t, ticketQty])

  const freeSeatingTotals = useMemo(() => {
    if (seatingType !== 'free' || !selectedTicket) return undefined
    const unit = selectedTicket.price
    const subtotal = unit * ticketQty
    const serviceFee = Math.round(subtotal * 0.05)
    const vat = Math.round((subtotal + serviceFee) * 0.15)
    const total = subtotal + serviceFee + vat
    return {
      lines: [
        {
          label: `${ticketQty} ticket${ticketQty === 1 ? '' : 's'}`,
          value: unit <= 0 ? 'Free' : formatMoneySar(subtotal),
        },
        ...(unit > 0
          ? [
              { label: 'Service fee', value: formatMoneySar(serviceFee) },
              { label: 'VAT 15%', value: formatMoneySar(vat) },
            ]
          : []),
      ],
      total: unit <= 0 ? 'Free' : formatMoneySar(total),
      unitPrice: unit,
      orderTotal: total,
    }
  }, [seatingType, selectedTicket, ticketQty])

  async function claimFreeTicket(): Promise<boolean> {
    if (!resolvedId || !selectedTicket) {
      dispatch(toastPushed('error', t('detail.claimFailed')))
      return false
    }

    let allowed = false
    requireAuth(() => {
      allowed = true
    })
    if (!allowed) return false

    try {
      const quantity = Math.max(1, ticketQty)
      const buyerName = user?.name?.trim() || 'Guest'
      const created = await createOrder({
        eventId: resolvedId,
        body: {
          ticketId: selectedTicket.id,
          quantity,
          items: [{ ticketId: selectedTicket.id, quantity }],
          beneficiaries: Array.from({ length: quantity }, (_, index) => ({
            quantity_id: index + 1,
            name: buyerName,
          })),
        },
      }).unwrap()

      const orderId = Number(created.id ?? created.orderId ?? created.order_id)
      if (!Number.isFinite(orderId) || orderId <= 0) {
        dispatch(toastPushed('error', t('detail.claimFailed')))
        return false
      }

      try {
        await payOrder({ orderId, brand: 'WALLET' }).unwrap()
      } catch {
        // Free orders may already be complete after create — still confirm.
      }

      sessionStorage.setItem('myticket.lastOrderId', String(orderId))
      sessionStorage.removeItem('myticket.pendingOrderId')
      navigate(`/order-confirmation?orderId=${orderId}`)
      return false
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('detail.claimFailed'))))
      return false
    }
  }

  function prepareFreeSeatingCheckout(): boolean {
    if (!resolvedId || !selectedTicket) {
      dispatch(toastPushed('error', t('detail.pickTicketType')))
      return false
    }
    if (ticketQty < 1) {
      dispatch(toastPushed('error', t('detail.pickTicketType')))
      return false
    }
    writeFreeSeatingSession({
      eventId: String(resolvedId),
      ticketId: selectedTicket.id,
      quantity: ticketQty,
      unitPrice: selectedTicket.price,
      slug: slugOrId || detailCard?.slug || listCard?.slug,
      label: selectedTicket.name,
    })
    sessionStorage.setItem('myticket.ticketId', String(selectedTicket.id))
    sessionStorage.setItem('myticket.eventId', String(resolvedId))
    if (slugOrId) sessionStorage.setItem('myticket.eventSlug', slugOrId)
    return true
  }

  const primaryLabel =
    seatingType === 'free'
      ? isFreeEvent || (selectedTicket?.price ?? 0) <= 0
        ? createState.isLoading || payState.isLoading
          ? t('detail.claiming')
          : t('detail.claimFreeTicket')
        : t('detail.continueCheckout')
      : t('detail.chooseSeats')

  const primaryTo =
    seatingType === 'free'
      ? isFreeEvent || (selectedTicket?.price ?? 0) <= 0
        ? undefined
        : '/checkout'
      : `/events/${slug ?? slugify(title)}/seats`

  async function handlePrimaryClick(): Promise<boolean> {
    if (seatingType === 'free') {
      if (isFreeEvent || (selectedTicket?.price ?? 0) <= 0) {
        return claimFreeTicket()
      }
      return prepareFreeSeatingCheckout()
    }
    const ticketTypeId =
      selectedTicket?.id ??
      firstTicketTypeId(apiDetail) ??
      (listCard && 'ticketTypeId' in listCard ? listCard.ticketTypeId : undefined)
    if (ticketTypeId) sessionStorage.setItem('myticket.ticketId', String(ticketTypeId))
    if (resolvedId) sessionStorage.setItem('myticket.eventId', String(resolvedId))
    return true
  }

  useEffect(() => {
    const nodes = TABS.map((item) => document.getElementById(TAB_IDS[item])).filter(
      (el): el is HTMLElement => el != null,
    )
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingToRef.current) return
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]
        if (!top?.target.id) return
        const match = (Object.entries(TAB_IDS) as [Tab, string][]).find(
          ([, id]) => id === top.target.id,
        )
        if (match) setTab(match[0])
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] },
    )

    for (const node of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const jumpTo = (item: Tab) => {
    const id = TAB_IDS[item]
    const el = document.getElementById(id)
    setTab(item)
    if (!el) return
    scrollingToRef.current = id
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      if (scrollingToRef.current === id) scrollingToRef.current = null
    }, 700)
  }

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Events', href: '/events' },
            { label: 'Concerts', href: '/events' },
            { label: title },
          ]}
        />
      </PageSection>

      <PageSection padTop={16} padBottom={0}>
        <FadeUp>
          <DetailGallery
            category={display.category}
            flag={display.flag}
            mainImage={detailCard?.image ?? listCard?.image ?? EVENT_DETAIL_GALLERY.main}
            thumbs={EVENT_DETAIL_GALLERY.thumbs}
          />
        </FadeUp>
      </PageSection>

      <PageSection padTop={24} padBottom={0}>
        <div className="grid w-full grid-cols-1 items-start gap-3xl lg:grid-cols-[minmax(0,1fr)_388px] lg:gap-x-[48px] lg:gap-y-0">
          <FadeUp className="min-w-0">
            <h1 className="text-balance text-display-hero text-ink-primary">{title}</h1>

            <div className="mt-[14px] flex flex-col gap-sm text-[14px] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-[18px] sm:gap-y-sm sm:text-[15px]">
              <span className="inline-flex items-center gap-[5px] font-semibold text-ink-primary">
                <StarFillIcon size={15} />
                {display.rating}
              </span>
              <span className="text-ink-secondary">{display.when}</span>
              <span className="text-ink-secondary">{display.venue}</span>
              {display.attendance ? (
                <span className="text-ink-secondary">{display.attendance}</span>
              ) : null}
            </div>

            <div className="mt-xl flex flex-col gap-md sm:mt-[22px] sm:flex-row sm:flex-wrap sm:gap-row-gap">
              <Button
                variant="secondary"
                className="h-[44px] w-full rounded-[20px] border px-lg sm:h-[40px] sm:w-auto"
                icon={<HeartGlyphIcon size={16} filled={isSaved} />}
                onClick={() => void handleSave()}
              >
                {isSaved ? t('detail.saved') : t('common:actions.save')}
              </Button>
              <Button
                variant="secondary"
                className="h-[44px] w-full rounded-[20px] border px-lg sm:h-[40px] sm:w-auto"
                icon={<ArrowUpRightIcon size={16} />}
                disabled
                title="Share not available yet"
              >
                {t('detail.share')}
              </Button>
              <Button
                variant="secondary"
                className="h-[44px] w-full rounded-[20px] border px-lg sm:h-[40px] sm:w-auto"
                icon={<CalendarIcon size={16} />}
                disabled
                title="Calendar export not available yet"
              >
                {t('detail.addToCalendar')}
              </Button>
            </div>
          </FadeUp>

          <StickyCtaCard
            className="min-w-0 lg:row-span-2 lg:row-start-1"
            fromPrice={display.fromPrice}
            note={EVENT_DETAIL.salesClose}
            tiers={freeSeatingTiers ?? EVENT_DETAIL.tiers}
            totals={freeSeatingTotals?.lines ?? EVENT_DETAIL.totals}
            total={freeSeatingTotals?.total ?? EVENT_DETAIL.total}
            primaryLabel={primaryLabel}
            primaryTo={primaryTo}
            primaryDisabled={createState.isLoading || payState.isLoading}
            qtyInteractive={seatingType === 'free' && apiTicketTypes.length > 0}
            onSelectTier={(name) => {
              const match = apiTicketTypes.find((tier) => tier.name === name)
              if (!match) return
              setSelectedTicketId(match.id)
              setTicketQty((qty) => Math.max(1, qty))
            }}
            onChangeQty={(name, qty) => {
              const match = apiTicketTypes.find((tier) => tier.name === name)
              if (!match) return
              setSelectedTicketId(match.id)
              setTicketQty(Math.max(0, qty))
            }}
            onPrimaryClick={() => handlePrimaryClick()}
            footerNote={EVENT_DETAIL.footerNote}
            aside={<StickyCtaAssurances items={EVENT_DETAIL.assurances} />}
          />

          <article className="min-w-0">
            <div className="sticky top-[var(--spacing-header)] z-10 bg-bg-page pt-sm">
              <DetailSectionTabs aria-label={t('detail.sectionsAria')} className="gap-xl sm:gap-[26px]">
                {TABS.map((item) => (
                  <DetailSectionTab
                    key={item}
                    active={tab === item}
                    onClick={() => jumpTo(item)}
                    className="flex min-h-[44px] items-end sm:min-h-0"
                  >
                    {t(TAB_LABEL_KEYS[item])}
                  </DetailSectionTab>
                ))}
              </DetailSectionTabs>
            </div>

            {/* About — Figma draws body + highlights with no section H2. */}
            <section id="about" className="scroll-mt-[calc(var(--spacing-header)+72px)]">
              <p className="mt-2xl max-w-[720px] text-pretty text-[15px] leading-[1.6] text-ink-body sm:mt-[28px] sm:text-[16px]">
                {EVENT_DETAIL.about}
              </p>
              <div className="mt-[18px] grid max-w-[720px] grid-cols-1 gap-md sm:grid-cols-2">
                {EVENT_DETAIL.highlights.map((h) => (
                  <div
                    key={h.title}
                    className="flex gap-[11px] rounded-[14px] border border-border-default bg-surface-default px-lg py-[14px]"
                  >
                    <span className="mt-[6px] size-[7px] shrink-0 rounded-full bg-brand-primary" />
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-ink-primary">{h.title}</p>
                      <p className="mt-[2px] text-[13px] leading-[1.45] text-pretty text-ink-secondary">
                        {h.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="line-up"
              className="scroll-mt-[calc(var(--spacing-header)+72px)] mt-3xl sm:mt-[44px]"
            >
              <h2 className="text-balance text-heading-h2-section text-ink-primary">
                {t('detail.lineUp')}
              </h2>
              <p className="mt-[6px] text-[14px] text-pretty text-ink-secondary sm:text-[15px]">
                Four acts across one stage. Set times published 48 hours before doors.
              </p>
              <div className="mt-[18px] grid grid-cols-2 gap-md sm:gap-lg lg:grid-cols-4">
                {EVENT_DETAIL.lineup.map((act) => (
                  <div
                    key={act.name}
                    className="overflow-hidden rounded-[16px] border border-border-default bg-surface-default"
                  >
                    <div className="aspect-[4/3] sm:aspect-auto sm:h-[150px]">
                      <img src={act.image} alt="" className="size-full object-cover" />
                    </div>
                    <div className="px-md py-md sm:px-[14px] sm:pt-[13px] sm:pb-[15px]">
                      <p className="text-[14px] font-semibold text-ink-primary sm:text-[15px]">
                        {act.name}
                      </p>
                      <p className="mt-[2px] text-[12px] text-ink-secondary sm:text-[13px]">
                        {act.role}
                      </p>
                      <p className="mt-sm text-[11px] font-semibold text-ink-brand sm:text-[12px]">
                        {act.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="venue"
              className="scroll-mt-[calc(var(--spacing-header)+72px)] mt-3xl sm:mt-[44px]"
            >
              <h2 className="text-balance text-heading-h2-section text-ink-primary">
                Venue & getting there
              </h2>
              <div className="mt-[18px] overflow-hidden rounded-[18px] border border-border-default bg-surface-default">
                <div className="relative h-[200px] w-full overflow-hidden bg-bg-skeleton sm:h-[260px]">
                  <img
                    src={EVENT_DETAIL_VENUE_MAP}
                    alt="Map of King Abdullah Park, Al Malaz, Riyadh"
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex flex-col items-stretch gap-md border-b border-border-divider px-lg py-md sm:flex-row sm:items-center sm:justify-between sm:gap-lg sm:px-3xl">
                  <p className="min-w-0 text-[13px] text-pretty text-ink-secondary sm:text-[14px]">
                    King Abdullah Park, Al Malaz, Riyadh 12836
                  </p>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-[44px] shrink-0 items-center justify-center rounded-[18px] border-[1.5px] border-border-default bg-surface-default px-lg text-[13px] font-semibold text-ink-primary hover:border-border-brand hover:text-ink-brand sm:h-[36px]"
                  >
                    Open in maps
                  </a>
                </div>
                <div className="flex flex-col gap-2xl px-lg pt-xl pb-2xl sm:flex-row sm:gap-3xl sm:px-3xl sm:pt-[22px] sm:pb-3xl">
                  {[
                    {
                      label: 'Address',
                      body: 'King Abdullah Park, Al Malaz, Riyadh 12836',
                    },
                    {
                      label: 'Getting there',
                      body: 'Metro Line 2 to Al Malaz (7 min walk). Paid parking in lots C and D, SAR 20.',
                    },
                    {
                      label: 'Accessibility',
                      body: 'Step-free entry at Gate 3. Wheelchair bays in the seated tier — book by phone.',
                    },
                  ].map((fact) => (
                    <div key={fact.label} className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                        {fact.label}
                      </p>
                      <p className="mt-[6px] text-[14px] leading-[1.5] text-pretty text-ink-body">
                        {fact.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section
              id="reviews"
              className="scroll-mt-[calc(var(--spacing-header)+72px)] mt-3xl sm:mt-[44px]"
            >
              <div className="flex flex-col gap-sm sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-md">
                <h2 className="min-w-0 text-balance text-heading-h2-section text-ink-primary">
                  {t('detail.reviews')}
                </h2>
                <div className="flex items-center gap-[5px] text-[14px] text-ink-secondary sm:text-[15px]">
                  <StarFillIcon size={15} />
                  <span>{EVENT_DETAIL.reviewsSummary}</span>
                </div>
              </div>
              <div className="mt-[18px] grid grid-cols-1 gap-lg lg:grid-cols-3">
                {REVIEWS.map((review) => (
                  <div
                    key={review.name}
                    className="flex flex-col gap-[11px] rounded-[16px] border border-border-default bg-surface-default p-lg sm:p-[18px]"
                  >
                    <div className="flex items-center gap-[11px]">
                      <Avatar
                        initials={review.initials}
                        size="md"
                        className="!size-[36px] !bg-border-divider !bg-none text-[14px] font-semibold text-ink-secondary"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-ink-primary">{review.name}</p>
                        <p className="text-[12px] text-ink-muted">{review.date}</p>
                      </div>
                      <StarFillIcon size={13} className="shrink-0" />
                      <span className="shrink-0 text-[13px] font-semibold text-ink-primary">
                        {review.rating}
                      </span>
                    </div>
                    <p className="text-[14px] leading-[1.55] text-pretty text-ink-secondary">
                      {review.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="policies"
              className="scroll-mt-[calc(var(--spacing-header)+72px)] mt-3xl pb-2xl sm:mt-[44px]"
            >
              <h2 className="text-balance text-heading-h2-section text-ink-primary">
                {t('detail.policies')}
              </h2>
              <div className="mt-[18px] rounded-[18px] border border-border-default bg-surface-default px-lg py-sm text-[14px] sm:px-[22px]">
                {POLICIES.map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={cn(
                      'flex flex-col gap-sm py-lg sm:flex-row sm:gap-3xl',
                      i < arr.length - 1 && 'border-b border-border-divider',
                    )}
                  >
                    <p className="w-full shrink-0 font-semibold text-ink-primary sm:w-[200px]">
                      {row.label}
                    </p>
                    <p className="min-w-0 flex-1 leading-[1.5] text-pretty text-ink-body">
                      {row.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </article>
        </div>
      </PageSection>

      <SimilarSection
        heading="You might also like"
        headingClassName="text-heading-h2-feature"
        link={{ label: 'All concerts in Riyadh', to: '/events' }}
      >
        {catalog
          .filter((e) => e.title !== title)
          .slice(0, 4)
          .map((event) => (
            <SimilarEventCard
              key={event.slug ?? event.title}
              slug={event.slug ?? slugify(event.title)}
              title={event.title}
              date={event.date}
              venue={event.venue}
              rating={event.rating}
              price={event.price}
              image={event.image}
            />
          ))}
      </SimilarSection>
    </>
  )
}

/**
 * Figma similar card `207:5148` — 315×~314, media 170, no catalog chrome
 * (no heart / badges / attendance). Kept local until a DS similar card exists.
 */
function SimilarEventCard({
  slug: eventSlug,
  title,
  date,
  venue,
  rating,
  price,
  image,
}: {
  slug: string
  title: string
  date: string
  venue: string
  rating: string
  price: string
  image?: string
}) {
  return (
    <Link
      to={`/events/${eventSlug}`}
      className="flex min-w-0 flex-col overflow-hidden rounded-[16px] border border-border-default bg-surface-default"
    >
      <div className="h-[150px] w-full overflow-hidden bg-bg-skeleton sm:h-[170px]">
        {image ? (
          <img src={image} alt="" className="size-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-lg pt-[15px] pb-[16px]">
        <p className="text-[12px] font-semibold text-ink-muted">{date}</p>
        <p className="mt-[6px] text-[15px] leading-[1.25] font-semibold text-balance text-ink-primary">
          {title}
        </p>
        <p className="mt-[6px] text-[13px] text-ink-secondary">{venue}</p>
        <div className="mt-auto flex items-end justify-between gap-md pt-[12px]">
          <span className="flex items-center gap-[5px] text-[13px] font-medium text-ink-primary">
            <StarFillIcon size={13} />
            {rating}
          </span>
          <span className="shrink-0 text-[15px] font-semibold tabular-nums text-ink-primary sm:text-[17px]">
            From {price}
          </span>
        </div>
      </div>
    </Link>
  )
}
