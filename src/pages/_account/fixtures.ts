/**
 * Fixture content for Guest account / support screens — transcribed from Figma frames
 * under `207:*`. Replace with API data later.
 */

import { SAVED_COVERS, SIDEBAR_REC_COVERS, TICKET_COVERS } from './account-media'

export const ACCOUNT_USER = {
  initials: 'SA',
  name: 'Sara Al-Harbi',
  displayName: 'Sara',
  city: 'Riyadh',
  memberSince: 'March 2024',
  dateOfBirth: '14 August 1996',
  nationalId: '1•••••••••4',
  email: 'sara@example.com',
  mobile: '+966 50 123 4567',
  eventsAttended: 14,
  upcoming: 3,
  wallet: 'SAR 340',
  walletBalance: 'SAR 121.00',
  walletPending: 'SAR 21.00',
  walletEarnedYear: 'SAR 347',
} as const

export type TicketStatus = 'UPCOMING' | 'AWAITING SEAT' | 'PAST' | 'TRANSFERRED' | 'LISTED'

export interface TicketFixture {
  id: string
  orderId: string
  title: string
  meta: string
  status: TicketStatus
  countdown?: string
  facts: { label: string; value: string }[]
  note?: string
  cover: string
  actions: ('qr' | 'transfer' | 'resell' | 'refund')[]
}

export const MY_TICKETS: TicketFixture[] = [
  {
    id: 'winter-nights',
    orderId: 'MT-2026-84193',
    title: 'Winter Nights: Live at King Abdullah Park',
    meta: 'Thu 8 Oct 2026 · Show 20:00 · King Abdullah Park, Riyadh',
    status: 'UPCOMING',
    countdown: 'IN 12 DAYS',
    facts: [
      { label: 'TIER', value: 'Gold · Floor A' },
      { label: 'ROW', value: 'C' },
      { label: 'SEATS', value: '11, 12' },
      { label: 'GATE', value: 'Gate 3' },
    ],
    note: 'Free refund until 5 Oct',
    cover: TICKET_COVERS['winter-nights'],
    actions: ['qr', 'transfer', 'resell', 'refund'],
  },
  {
    id: 'nada-warehouse',
    orderId: 'MT-2026-84702',
    title: 'Nada Sharif — Warehouse Set',
    meta: 'Sat 24 Oct 2026 · Show 21:30 · The Warehouse, Jeddah',
    status: 'UPCOMING',
    countdown: 'IN 26 DAYS',
    facts: [
      { label: 'TIER', value: 'General standing' },
      { label: 'ROW', value: '—' },
      { label: 'TICKETS', value: '1' },
      { label: 'ENTRY', value: 'Door B' },
    ],
    cover: TICKET_COVERS['nada-warehouse'],
    actions: ['qr', 'transfer', 'resell'],
  },
  {
    id: 'symphony-sands',
    orderId: 'MT-2026-85110',
    title: 'Symphony of the Sands',
    meta: 'Fri 6 Nov 2026 · Show 19:00 · AlUla Amphitheatre',
    status: 'AWAITING SEAT',
    countdown: 'IN 40 DAYS',
    facts: [
      { label: 'TIER', value: 'Silver' },
      { label: 'ROW', value: 'Assigned 1 Nov' },
      { label: 'TICKETS', value: '3' },
      { label: 'GATE', value: 'TBC' },
    ],
    note: 'Seats are allocated a week before',
    cover: TICKET_COVERS['symphony-sands'],
    actions: ['qr', 'transfer', 'refund'],
  },
]

export const ACCOUNT_NAV_LINKS = [
  { label: 'Favourites', meta: '14 saved', href: '/saved' },
  { label: 'Waitlists', meta: '2 waiting', href: '/saved' },
  { label: 'My enquiries', meta: '1 open', href: '/my-enquiries' },
  { label: 'My reviews', meta: '6 written', href: '/my-reviews' },
  { label: 'Payment methods', meta: '3 saved', href: '/settings' },
] as const

export const SIDEBAR_RECS = [
  {
    title: 'Soundstorm Festival',
    meta: 'Thu 22 Oct · from SAR 450',
    cover: SIDEBAR_REC_COVERS[0],
    href: '/events',
  },
  {
    title: 'Desert Cinema Nights',
    meta: 'Fri 30 Oct · from SAR 95',
    cover: SIDEBAR_REC_COVERS[1],
    href: '/events',
  },
  {
    title: 'Layali Oud Sessions',
    meta: 'Sat 7 Nov · from SAR 140',
    cover: SIDEBAR_REC_COVERS[2],
    href: '/events',
  },
] as const

export type SavedKind = 'Event' | 'Experience' | 'Talent' | 'Vendor'

export interface SavedItemFixture {
  title: string
  kind: SavedKind
  when: string
  place: string
  price: string
  cta: string
  href: string
  cover: string
}

export const SAVED_ITEMS: SavedItemFixture[] = [
  {
    title: 'Winter Nights: Live at King Abdullah Park',
    kind: 'Event',
    when: 'THU 8 OCT · 20:00',
    place: 'King Abdullah Park, Riyadh',
    price: 'SAR 180',
    cta: 'Get tickets',
    href: '/events/winter-nights',
    cover: SAVED_COVERS[0],
  },
  {
    title: 'Al-Hilal vs Al-Nassr',
    kind: 'Event',
    when: 'FRI 9 OCT · 21:00',
    place: 'Kingdom Arena, Riyadh',
    price: 'SAR 240',
    cta: 'Get tickets',
    href: '/events',
    cover: SAVED_COVERS[1],
  },
  {
    title: 'Hegra Archaeological Site',
    kind: 'Experience',
    when: 'OPEN YEAR-ROUND',
    place: 'AlUla, Madinah Region',
    price: 'SAR 95',
    cta: 'Book a visit',
    href: '/experiences',
    cover: SAVED_COVERS[2],
  },
  {
    title: 'Layal Qasim',
    kind: 'Talent',
    when: 'ARABIC POP',
    place: 'Based in Jeddah',
    price: '4.9',
    cta: 'View profile',
    href: '/talents/layal-qasim',
    cover: SAVED_COVERS[3],
  },
  {
    title: 'Soundstorm Festival',
    kind: 'Event',
    when: 'THU 22 OCT · 16:00',
    place: 'Banban, Riyadh',
    price: 'SAR 450',
    cta: 'Get tickets',
    href: '/events',
    cover: SAVED_COVERS[4],
  },
  {
    title: 'Wadi Namar Waterfall Park',
    kind: 'Experience',
    when: 'OPEN DAILY',
    place: 'Riyadh',
    price: 'SAR 65',
    cta: 'Book a visit',
    href: '/experiences',
    cover: SAVED_COVERS[5],
  },
  {
    title: 'StageCraft KSA',
    kind: 'Vendor',
    when: 'PRODUCTION',
    place: 'Riyadh · Jeddah',
    price: 'Hire',
    cta: 'Enquire',
    href: '/vendors/stagecraft',
    cover: SAVED_COVERS[6],
  },
  {
    title: 'Desert Cinema Nights',
    kind: 'Event',
    when: 'FRI 30 OCT · 19:30',
    place: 'Edge of the World',
    price: 'SAR 95',
    cta: 'Get tickets',
    href: '/events',
    cover: SAVED_COVERS[7],
  },
]

export interface NotificationFixture {
  title: string
  body: string
  time: string
  unread: boolean
  group: 'TODAY' | 'YESTERDAY' | 'EARLIER'
  category: 'all' | 'tickets' | 'waitlists' | 'prices' | 'following' | 'enquiries'
  tag?: string
  cta?: string
  icon: 'star' | 'mail' | 'ticket' | 'price' | 'heart'
}

export const NOTIFICATIONS: NotificationFixture[] = [
  {
    title: "A ticket freed up — it's yours for 18 minutes",
    body: "Someone released a Soundstorm 3-day pass. You're first in the queue. Claim it before 21:40 or it passes to the next person.",
    time: '12 minutes ago',
    unread: true,
    group: 'TODAY',
    category: 'waitlists',
    tag: 'Act now',
    cta: 'Claim ticket',
    icon: 'star',
  },
  {
    title: 'Nova Stage Systems replied to your enquiry',
    body: "They've sent a quote for the 14 November corporate night — SAR 82,400 including the LED backdrop you asked about.",
    time: '2 hours ago',
    unread: true,
    group: 'TODAY',
    category: 'enquiries',
    cta: 'Read reply',
    icon: 'mail',
  },
  {
    title: 'Your ticket for tonight is ready',
    body: 'Stand-up Night: Riyadh Comedy Club, 21:30 at Boulevard City. Doors open 20:45 — gate C, seat H14.',
    time: '5 hours ago',
    unread: true,
    group: 'TODAY',
    category: 'tickets',
    cta: 'Open ticket',
    icon: 'ticket',
  },
  {
    title: 'Price dropped on a favourite',
    body: 'Winter Nights Gold seats are now from SAR 165 — down from SAR 180.',
    time: 'Yesterday · 16:20',
    unread: false,
    group: 'YESTERDAY',
    category: 'prices',
    cta: 'View event',
    icon: 'price',
  },
  {
    title: 'Cashback credited',
    body: 'SAR 18.00 landed in your wallet from Riyadh Comedy Club.',
    time: 'Yesterday · 09:10',
    unread: false,
    group: 'YESTERDAY',
    category: 'tickets',
    cta: 'Open wallet',
    icon: 'ticket',
  },
  {
    title: 'Review reminder',
    body: 'How was Nada Sharif — Warehouse Set? Leave a quick review.',
    time: '12 Sep',
    unread: false,
    group: 'EARLIER',
    category: 'following',
    cta: 'Write review',
    icon: 'heart',
  },
]

export interface WalletTxnFixture {
  label: string
  detail: string
  date: string
  amount: string
  status: string
  tone: 'credit' | 'debit' | 'pending'
}

export const WALLET_TXNS: WalletTxnFixture[] = [
  {
    label: 'Cashback · Winter Nights',
    detail: 'Releases after the show',
    date: '8 Oct 2026',
    amount: '+ SAR 21.00',
    status: 'Pending',
    tone: 'pending',
  },
  {
    label: 'Paid towards Winter Nights',
    detail: 'Order MT-2026-84193',
    date: '27 Jul 2026',
    amount: '− SAR 60.00',
    status: 'Spent at checkout',
    tone: 'debit',
  },
  {
    label: 'Cashback · Riyadh Comedy Club',
    detail: 'Order MT-2026-71204',
    date: '20 Apr 2026',
    amount: '+ SAR 18.00',
    status: 'Available',
    tone: 'credit',
  },
  {
    label: 'Auction sale · Gold pair',
    detail: 'Payout reference PO-30291',
    date: '12 Mar 2026',
    amount: '+ SAR 420.00',
    status: 'Available',
    tone: 'credit',
  },
  {
    label: 'Refund · Comedy Night',
    detail: 'Order MT-2026-69011',
    date: '2 Feb 2026',
    amount: '+ SAR 95.00',
    status: 'Available',
    tone: 'credit',
  },
]

export const REVIEWS_AWAITING = [
  {
    initials: 'RC',
    name: 'Riyadh Comedy Club — April Showcase',
    kind: 'Event',
    meta: 'You were there · Sat 18 Apr 2026 · ticket scanned 20:41',
  },
  {
    initials: 'NE',
    name: 'Nights Entertainment Co.',
    kind: 'Organizer',
    meta: 'Ran 2 events you attended this year',
  },
  {
    initials: 'LO',
    name: 'Layla Oud Ensemble',
    kind: 'Talent',
    meta: 'Engagement you booked, marked complete 2 Jul 2026',
  },
] as const

export const REVIEWS = [
  {
    event: 'Riyadh Season Opening Night',
    rating: 5,
    excerpt: 'Flawless entry with QR, seats exactly as shown. Will book again.',
    date: '12 Aug 2026',
  },
  {
    event: 'Al Hilal vs Al Nassr',
    rating: 4,
    excerpt: 'Great atmosphere. Gate queues moved faster than expected.',
    date: '2 Jun 2026',
  },
] as const

export const ENQUIRIES = [
  {
    id: 'EQ-1042',
    party: 'Nova Stage Systems',
    subject: 'Corporate night · 1,200 guests · Riyadh Front',
    status: 'Quoted',
    updated: '2h ago',
    unread: true,
    preview: "They've sent a quote for 14 November — SAR 82,400 including the LED backdrop.",
  },
  {
    id: 'EQ-0988',
    party: 'StageCraft KSA',
    subject: 'Lighting package · wedding reception',
    status: 'Open',
    updated: '3 days ago',
    unread: false,
    preview: 'Waiting on your reply with guest count and venue plan.',
  },
] as const

export const SUBMISSIONS = [
  {
    id: 'SUB-2201',
    name: 'Wadi Namar Waterfall Park',
    status: 'Draft',
    meta: 'Riyadh · started 3 Aug 2026 · parts 1–2 of 4 done',
    note: 'Your draft is saved. Pick it up where you left off — photos and contact details still to go.',
    cta: 'Continue draft',
    aux: 'Delete draft',
    cover: SAVED_COVERS[5],
  },
  {
    id: 'SUB-2140',
    name: 'Hidden Valley Hiking Trail',
    status: 'Under review',
    meta: 'Diriyah · submitted 28 Jul 2026 · ref EX-30412',
    note: "Locked while our team checks it — usually within 3 working days. We'll notify you the moment there's news.",
    cta: 'View submission',
    aux: 'Withdraw',
    cover: SAVED_COVERS[2],
  },
  {
    id: 'SUB-2099',
    name: 'Al Bujairi Terrace Gardens',
    status: 'Published',
    meta: 'Diriyah · published 12 Jun 2026',
    note: 'Live on Experiences — 2,418 people have viewed it, 96 saved it. Thanks for adding it!',
    cta: 'See it live',
    cover: SAVED_COVERS[0],
  },
  {
    id: 'SUB-1988',
    name: 'Corniche Sunset Point',
    status: 'Declined',
    meta: 'Jeddah · reviewed 20 May 2026',
    note: 'Reason: this place already exists on MyTicket as “Jeddah Corniche North”. If you think that’s wrong, reply from the notification and we’ll take another look.',
    cta: 'View details',
    cover: SAVED_COVERS[7],
  },
] as const

export const AUCTION_ACTIVITY = [
  {
    title: 'Winter Nights: Live',
    status: 'No bids yet',
    statusTone: 'neutralOutline' as const,
    meta: 'Terrace · Free standing · Thu 8 Oct · 20:00',
    priceLabel: 'Starting price',
    price: 'SAR 240',
    receive: 'SAR 216.00',
    timer: '09:52:40',
    timerUrgent: false,
    primary: 'View listing',
    secondary: 'Cancel listing',
    tab: 'selling' as const,
  },
  {
    title: 'Jazz at the Boulevard',
    status: '3 bids',
    statusTone: 'brandTint' as const,
    meta: 'Table seat · Zone 2 · Fri 16 Oct · 21:30',
    priceLabel: 'Highest bid',
    price: 'SAR 210',
    priceSub: '3 bids',
    receive: 'SAR 189.00',
    timer: '1d 04:18',
    timerUrgent: false,
    primary: 'View listing',
    secondary: 'Cancel listing',
    tab: 'selling' as const,
  },
  {
    title: 'Gold pair · Winter Nights',
    status: 'Winning',
    statusTone: 'successTint' as const,
    meta: 'Gold · Floor A · Thu 8 Oct · 20:00',
    priceLabel: 'Your bid',
    price: 'SAR 640',
    receive: '—',
    timer: '4h 12m',
    timerUrgent: true,
    primary: 'Open lot',
    secondary: 'Raise bid',
    tab: 'bidding' as const,
  },
] as const

export const SUPPORT_CASES = [
  {
    id: 'CS-7781',
    subject: 'Refund for cancelled comedy night',
    status: 'In progress',
    updated: 'Today · 14:20',
  },
  {
    id: 'CS-7610',
    subject: 'QR not scanning at Gate 3',
    status: 'Resolved',
    updated: '12 Aug 2026',
  },
] as const

export const TONIGHT_EVENTS = [
  {
    title: 'AlUla Sky Lantern Evening',
    meta: 'TODAY · 19:30',
    place: 'AlUla Old Town',
    price: 'SAR 180',
  },
  {
    title: 'Riyadh Comedy Club',
    meta: 'TODAY · 21:00',
    place: 'Comedy Club Riyadh',
    price: 'SAR 95',
  },
  {
    title: 'Oud Night with Omar Farouk',
    meta: 'TODAY · 20:00',
    place: 'Bayt AlOud, Jeddah',
    price: 'SAR 120',
  },
] as const

export const PROFILE_NIGHTS = [
  {
    id: 'winter-nights',
    title: 'Winter Nights at King Abdullah Park',
    meta: 'Thu 8 Oct · 20:00 · King Abdullah Park',
    seat: 'Gold · Floor A · C11–12',
    status: 'CONFIRMED',
    statusTone: 'successTint' as const,
    countdown: 'IN 12 DAYS',
  },
  {
    id: 'nada-warehouse',
    title: 'Nada Sharif — Warehouse Set',
    meta: 'Sat 24 Oct · 21:30 · The Warehouse',
    seat: 'General standing · 1 ticket',
    status: 'INSTALMENTS',
    statusTone: 'infoTint' as const,
    countdown: 'IN 26 DAYS',
  },
  {
    id: 'symphony-sands',
    title: 'Symphony of the Sands',
    meta: 'Fri 6 Nov · 19:00 · AlUla Amphitheatre',
    seat: 'Silver · seats assigned 1 Nov',
    status: 'AWAITING SEAT',
    statusTone: 'brandTint' as const,
    countdown: 'IN 40 DAYS',
  },
] as const
