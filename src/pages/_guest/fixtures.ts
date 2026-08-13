/**
 * Shared fixture content for guest browse/directory screens.
 * Shapes match card props already built; replace with API data later.
 */
import {
  HOME_AUCTIONS,
  HOME_EVENTS,
  HOME_EXPERIENCES,
  HOME_ORGANIZERS,
  HOME_TALENTS,
  HOME_VENDORS,
} from '@/pages/home/home-data'
import { AUCTION_LISTING_IMAGES } from './auctions-media'
import {
  EVENT_CATALOG_IMAGES,
  EVENT_DETAIL_LINEUP_IMAGES,
  EVENT_DETAIL_ORGANIZER_AVATAR,
} from './events-media'
import { EXPERIENCE_CATALOG_IMAGES } from './experiences-media'
import {
  ORGANIZER_COVER_IMAGES,
  ORGANIZER_MARK_IMAGES,
} from './organizers-media'
import { TALENT_CATALOG_IMAGES } from './talents-media'
import { VENDOR_DIRECTORY_IMAGES } from './vendors-media'

export const EVENT_CATEGORY_CHIPS = [
  'All events',
  'Concerts',
  'Music',
  'Festivals',
  'Sports',
  'Theatre & Arts',
  'Comedy',
  'Conferences',
  'Workshops',
  'Exhibitions',
  'Family & Children',
  'Food & Drink',
  'Cultural',
] as const

export const CITY_FACETS = [
  { label: 'Riyadh', count: 62 },
  { label: 'Jeddah', count: 41 },
  { label: 'Dammam', count: 18 },
  { label: 'Khobar', count: 14 },
  { label: 'AlUla', count: 11 },
  { label: 'Abha', count: 9 },
] as const

export const WHEN_OPTIONS = [
  'Any date',
  'Today',
  'This week',
  'Weekend',
  'This month',
] as const

export const RATING_OPTIONS = ['Any', '4.0+', '4.5+', '4.8+'] as const

export const OTHER_FILTERS = [
  'Free cancellation',
  'Family friendly',
  'Accessible seating',
  'Instant e-ticket',
] as const

/** Events listing grid — Figma `207:4600` EventCard/Catalog row copy + photography. */
export const CATALOG_EVENTS = [
  {
    date: 'Thu 8 Oct · 20:00',
    title: 'Winter Nights: Live at King Abdullah Park',
    venue: 'King Abdullah Park, Riyadh',
    rating: '4.8',
    attendance: '3,410 attending',
    price: 'SAR 180',
    category: 'Concerts',
    flag: 'Nearly sold out',
    image: EVENT_CATALOG_IMAGES[0],
  },
  {
    date: 'Thu 22 Oct · 16:00',
    title: 'Soundstorm Festival — Day 1',
    venue: 'Banban, Riyadh',
    rating: '4.9',
    attendance: '180,000 attending',
    price: 'SAR 450',
    category: 'Festivals',
    flag: 'Selling fast',
    image: EVENT_CATALOG_IMAGES[1],
  },
  {
    date: 'Sat 10 Oct · 21:00',
    title: 'Layal Qasim — Arabic Pop Night',
    venue: 'Princess Nourah Hall, Riyadh',
    rating: '4.7',
    attendance: '1,860 attending',
    price: 'SAR 220',
    category: 'Concerts',
    image: EVENT_CATALOG_IMAGES[2],
  },
  {
    date: 'Sat 17 Oct · 19:00',
    title: 'Jeddah Nights at Al-Balad',
    venue: 'Historic Al-Balad, Jeddah',
    rating: '4.8',
    attendance: '5,240 attending',
    price: 'SAR 90',
    category: 'Cultural',
    image: EVENT_CATALOG_IMAGES[3],
  },
  {
    date: 'Fri 16 Oct · 20:30',
    title: 'Symphony of the Sands',
    venue: 'AlUla Maraya Hall',
    rating: '5.0',
    attendance: '740 attending',
    price: 'SAR 380',
    category: 'Concerts',
    flag: 'Few left',
    image: EVENT_CATALOG_IMAGES[4],
  },
  {
    date: 'Fri 23 Oct · 18:00',
    title: 'Dammam Jazz Weekend',
    venue: 'Al-Marjan Amphitheatre',
    rating: '4.6',
    attendance: '2,110 attending',
    price: 'SAR 130',
    category: 'Concerts',
    image: EVENT_CATALOG_IMAGES[5],
  },
  {
    date: 'Sat 24 Oct · 22:00',
    title: 'Nada Sharif — Warehouse Set',
    venue: 'The Warehouse, Riyadh',
    rating: '4.7',
    attendance: '1,320 attending',
    price: 'SAR 160',
    category: 'Concerts',
    flag: '18+',
    image: EVENT_CATALOG_IMAGES[6],
  },
  {
    date: 'Thu 29 Oct · 17:00',
    title: 'Khobar Beach Sessions',
    venue: 'Khobar Corniche',
    rating: '4.5',
    attendance: '6,400 attending',
    price: 'SAR 75',
    category: 'Festivals',
    image: EVENT_CATALOG_IMAGES[7],
  },
  {
    date: 'Sun 1 Nov · 20:00',
    title: 'Oud & Strings: Tarek Al-Nasser',
    venue: 'King Fahd Cultural Centre',
    rating: '4.9',
    attendance: '980 attending',
    price: 'SAR 200',
    category: 'Concerts',
    image: EVENT_CATALOG_IMAGES[8],
  },
] as const

export const CATALOG_TALENTS = [
  ...HOME_TALENTS.map((t, i) => ({
    name: t.name,
    discipline: t.discipline,
    meta: `${t.reviews} reviews · ${t.city}`,
    rating: t.rating,
    nextShow: t.nextEvent
      ? {
          headline: `${t.nextLabel?.replace('Next · ', '') ?? ''} · ${t.nextEvent}`,
          detail: `${t.city} · from SAR 120`,
        }
      : undefined,
    verified: t.verified,
    image: TALENT_CATALOG_IMAGES[i],
  })),
  {
    name: 'Hala Rashed',
    discipline: 'Singer · Khaleeji',
    meta: '18.2k followers · 5 shows',
    rating: '4.8',
    nextShow: {
      headline: 'Sat 18 Oct · Jeddah Waterfront Gala',
      detail: 'Jeddah · from SAR 150',
    },
    verified: true,
    image: TALENT_CATALOG_IMAGES[5],
  },
  {
    name: 'Ensemble Najd',
    discipline: 'Folk · Fusion',
    meta: '9.4k followers · 2 shows',
    rating: '4.7',
    nextShow: {
      headline: 'Thu 8 Oct · Winter Nights Opening',
      detail: 'Riyadh · from SAR 180',
    },
    verified: true,
    image: TALENT_CATALOG_IMAGES[6],
  },
  {
    name: 'Omar Farouk',
    discipline: 'Oud · Classical',
    meta: '6.1k followers · 4 shows',
    rating: '4.9',
    nextShow: {
      headline: 'Wed 14 Oct · Bayt AlOud Night',
      detail: 'Jeddah · from SAR 120',
    },
    verified: false,
    image: TALENT_CATALOG_IMAGES[7],
  },
  {
    name: 'Bader Saleh',
    discipline: 'Comedy · Stand-up',
    meta: '112k followers · 8 shows',
    rating: '4.8',
    nextShow: {
      headline: 'Sat 10 Oct · Comedy Night',
      detail: 'Riyadh · from SAR 95',
    },
    verified: true,
    image: TALENT_CATALOG_IMAGES[8],
  },
]

export const CATALOG_EXPERIENCES = [
  {
    title: 'Desert dinner under the stars',
    location: 'Al-Thumamah, Riyadh',
    tags: ['Guided tours', 'Family'],
    meta: 'Food & desert · 4 hrs',
    place: 'Al-Thumamah, Riyadh',
    rating: '4.9 (214)',
    guests: 'Max 12 guests',
    price: 'SAR 320',
    flag: 'Bestseller',
    image: EXPERIENCE_CATALOG_IMAGES[0],
  },
  {
    title: 'Old Jeddah heritage walk with a historian',
    location: 'Al-Balad, Jeddah',
    tags: ['Walking', 'Heritage'],
    meta: 'Culture · 2.5 hrs',
    place: 'Al-Balad, Jeddah',
    rating: '4.8 (168)',
    guests: 'Max 10 guests',
    price: 'SAR 140',
    image: EXPERIENCE_CATALOG_IMAGES[1],
  },
  {
    title: 'Hegra at sunrise, before the crowds',
    location: 'Hegra, AlUla',
    tags: ['Guided tours', 'Sunrise'],
    meta: 'Heritage · 4 hrs',
    place: 'AlUla',
    rating: '5.0 (96)',
    guests: 'Max 8 guests',
    price: 'SAR 460',
    image: EXPERIENCE_CATALOG_IMAGES[2],
  },
  {
    title: 'Arabic coffee roasting workshop',
    location: 'Diriyah, Riyadh',
    tags: ['Workshop', 'Food'],
    meta: 'Workshops · 90 min',
    place: 'Diriyah',
    rating: '4.7 (132)',
    guests: 'Max 14 guests',
    price: 'SAR 180',
    image: EXPERIENCE_CATALOG_IMAGES[3],
  },
  {
    title: 'Red Sea reef snorkel and boat lunch',
    location: 'Farasan Islands, Jazan',
    tags: ['Outdoors', 'Family'],
    meta: 'Outdoors · Full day',
    place: 'Jazan',
    rating: '4.8 (88)',
    guests: 'Max 16 guests',
    price: 'SAR 540',
    image: EXPERIENCE_CATALOG_IMAGES[4],
  },
  {
    title: 'Backstage studio session with a producer',
    location: 'Boulevard, Riyadh',
    tags: ['Music', 'Workshop'],
    meta: 'Music · 2 hrs',
    place: 'Riyadh',
    rating: '4.9 (54)',
    guests: 'Max 6 guests',
    price: 'SAR 380',
    image: EXPERIENCE_CATALOG_IMAGES[5],
  },
  {
    title: 'Edge of the World hike and picnic',
    location: 'Edge of the World, Riyadh Region',
    tags: ['Outdoors', 'Guided'],
    meta: 'Outdoors · Half day',
    place: 'Riyadh Region',
    rating: '4.8 (201)',
    guests: 'Max 12 guests',
    price: 'SAR 260',
    image: EXPERIENCE_CATALOG_IMAGES[6],
  },
  {
    title: 'Najdi cooking class in a family home',
    location: 'Al Diriyah, Riyadh',
    tags: ['Food', 'Family'],
    meta: 'Food & desert · 3 hrs',
    place: 'Al Diriyah',
    rating: '4.9 (77)',
    guests: 'Max 8 guests',
    price: 'SAR 220',
    image: EXPERIENCE_CATALOG_IMAGES[7],
  },
  ...HOME_EXPERIENCES.map((e, i) => ({
    title: e.title,
    location: e.location,
    tags: [e.category, 'Guided tours'],
    meta: `${e.category} · Half day`,
    place: e.location.split(',')[0] ?? e.location,
    rating: `${e.rating} (${e.reviews.replace(' reviews', '')})`,
    guests: 'Max 10 guests',
    price: 'SAR 200',
    image: EXPERIENCE_CATALOG_IMAGES[i % EXPERIENCE_CATALOG_IMAGES.length],
  })),
]

export const CATALOG_VENDORS = HOME_VENDORS.map((v, i) => ({
  name: v.name,
  services: v.services,
  rating: v.rating,
  meta: `${v.coverage} · 120+ reviews`,
  price: 'SAR 9,000',
  verified: v.verified,
  image: VENDOR_DIRECTORY_IMAGES[i % VENDOR_DIRECTORY_IMAGES.length],
}))

export const CATALOG_ORGANIZERS = HOME_ORGANIZERS.map((o, i) => ({
  name: o.name,
  events: o.events,
  rating: o.rating,
  category:
    i % 2 === 0
      ? 'Entertainment season · Riyadh'
      : 'Sports & culture · Kingdom-wide',
  followers: ['1.2M', '840k', '620k', '210k', '180k', '95k'][i] ?? '50k',
  verified: true,
  cover: ORGANIZER_COVER_IMAGES[i],
  avatar: ORGANIZER_MARK_IMAGES[i],
}))

const CATALOG_AUCTION_EXTRAS = [
  {
    seatInfo: 'Block B · Row 12 · Seats 8–9 together',
    seller: 'Noura K.',
    bids: 14,
    watching: 48,
    faceValue: 'SAR 280',
    tag: 'Under face' as string | undefined,
    category: 'CONCERTS' as const,
  },
  {
    seatInfo: 'West stand · Row 4 · Seat 22',
    seller: 'Faisal M.',
    bids: 31,
    watching: 112,
    faceValue: 'SAR 450',
    tag: 'Hot' as string | undefined,
    category: 'SPORTS' as const,
  },
  {
    seatInfo: 'GA wristband · transferable',
    seller: 'Sara A.',
    bids: 6,
    watching: 22,
    faceValue: 'SAR 650',
    tag: undefined as string | undefined,
    category: 'FESTIVALS' as const,
  },
  {
    seatInfo: 'Grandstand · Row 6 · Seats 11–12',
    seller: 'Omar H.',
    bids: 9,
    watching: 35,
    faceValue: 'SAR 340',
    tag: 'Seats together' as string | undefined,
    category: 'MOTORSPORT' as const,
  },
] as const

/** Hub listings — Figma `207:10792` draws five rows; 5th is Symphony + listing-5. */
export const CATALOG_AUCTIONS = [
  ...HOME_AUCTIONS.map((a, i) => ({
    ...a,
    ...(CATALOG_AUCTION_EXTRAS[i] ?? {
      seatInfo: 'General admission',
      seller: 'Seller',
      bids: 4,
      watching: 12,
      faceValue: 'SAR 300',
      tag: undefined as string | undefined,
      category: 'CONCERTS' as const,
    }),
    image: AUCTION_LISTING_IMAGES[i] ?? AUCTION_LISTING_IMAGES[0],
  })),
  {
    listings: '3 listings',
    endsIn: '1d 04:22',
    title: 'Symphony of the Sands',
    meta: 'Fri 16 Oct · 20:30 · AlUla Maraya Hall',
    highestBid: 'SAR 340',
    buyNow: 'SAR 480',
    seatInfo: '2 seats · Row D, 8–9',
    seller: 'Hala T.',
    bids: 9,
    watching: 52,
    faceValue: 'SAR 380',
    tag: undefined as string | undefined,
    category: 'CONCERTS' as const,
    image: AUCTION_LISTING_IMAGES[4],
  },
]

export const EVENT_DETAIL = {
  title: 'Winter Nights: Live at King Abdullah Park',
  category: 'Concerts',
  flag: 'Nearly sold out · 8% left',
  rating: '4.8 (312 reviews)',
  reviewsSummary: '4.8 average · 312 reviews from past editions',
  when: 'Thursday 8 October 2026 · 20:00 – 23:30',
  venue: 'King Abdullah Park, Riyadh',
  attendance: '3,410 attending',
  fromPrice: 'SAR 180',
  salesClose: 'Sales close Thu 8 Oct · 18:00',
  about:
    "Riyadh's winter season opens with a full-scale outdoor production in King Abdullah Park — four acts, a 40-metre stage and a park laid out for 8,000 people. Gates open at 18:30 with food stalls, a market and family seating on the eastern lawn; the main set begins at 20:00 and runs to 23:30. The show goes ahead in all weather.",
  highlights: [
    {
      title: 'Gates 18:30, show 20:00',
      body: 'Arrive early — security screening takes around 20 minutes at peak.',
    },
    {
      title: 'Family seating available',
      body: 'Eastern lawn is seated and reserved for families and children under 12.',
    },
    {
      title: 'Cashless venue',
      body: 'Card and Apple Pay only at all food, drink and merchandise stalls.',
    },
    {
      title: 'E-ticket entry',
      body: 'Your QR code lives in the MyTicket app — no printing, no collection desk.',
    },
  ],
  lineup: [
    {
      name: 'Layal Qasim',
      role: 'Headline · Arabic pop',
      time: '22:00 – 23:30',
      image: EVENT_DETAIL_LINEUP_IMAGES[0],
    },
    {
      name: 'Tarek Al-Nasser',
      role: 'Oud · Traditional',
      time: '21:00 – 21:45',
      image: EVENT_DETAIL_LINEUP_IMAGES[1],
    },
    {
      name: 'Nada Sharif',
      role: 'DJ · Electronic',
      time: '20:15 – 20:50',
      image: EVENT_DETAIL_LINEUP_IMAGES[2],
    },
    {
      name: 'The Najd Collective',
      role: 'Opening · Folk fusion',
      time: '20:00 – 20:15',
      image: EVENT_DETAIL_LINEUP_IMAGES[3],
    },
  ],
  organizer: {
    name: 'Riyadh Season',
    eventsLabel: '84 events ·',
    rating: '4.8',
    sinceLabel: 'Organizer since 2019',
    bio: "The entertainment authority behind the Kingdom's largest seasonal programme, running arena concerts, festivals and family shows across Riyadh from October to March.",
    avatar: EVENT_DETAIL_ORGANIZER_AVATAR,
  },
  tiers: [
    {
      name: 'General admission',
      detail: 'Standing, main field',
      price: 'SAR 180',
      left: '212 left',
      maxLabel: 'Max 6 per order',
      selected: true,
      qty: 2,
    },
    {
      name: 'Silver seated',
      detail: 'Tiered seating, rows 12–24',
      price: 'SAR 320',
      left: '48 left',
      maxLabel: 'Max 6 per order',
      urgent: true,
      selected: false,
      qty: 0,
    },
    {
      name: 'Gold front stage',
      detail: 'Standing pit, first 8 metres',
      price: 'SAR 520',
      left: 'Only 9 left',
      maxLabel: 'Max 4 per order',
      urgent: true,
      selected: false,
      qty: 0,
    },
    {
      name: 'VIP lounge',
      detail: 'Private terrace, hospitality, parking',
      price: 'SAR 1,250',
      left: 'Sold out',
      maxLabel: 'Waitlist available',
      selected: false,
      qty: 0,
      soldOutRail: {
        note: 'Sold out — resale seats are open.',
        cta: 'Bid in the auction',
      },
    },
  ],
  totals: [
    { label: '2 tickets', value: 'SAR 360' },
    { label: 'Service fee', value: 'SAR 18' },
    { label: 'VAT 15%', value: 'SAR 57' },
  ],
  total: 'SAR 435',
  footerNote:
    "You'll pick seats on the hall map, then sign in to pay. Earn SAR 7 cashback to your MyTicket wallet.",
  resale: {
    title: 'Resale auction',
    ends: 'Ends in 02:41:18',
    body: '12 fans are reselling tickets for this event. Highest bid SAR 220, buy now from SAR 340.',
    cta: 'View 12 listings',
  },
  assurances: [
    'Tickets are issued by the organizer and verified by MyTicket.',
    'Payment is held securely and released after the event.',
    'Your QR code works offline in the MyTicket app.',
  ],
}

export { HOME_AUCTIONS, HOME_EVENTS, HOME_EXPERIENCES, HOME_ORGANIZERS, HOME_TALENTS, HOME_VENDORS }
