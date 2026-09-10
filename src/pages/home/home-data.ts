/**
 * Fixture content for the Home page, transcribed from Figma frame `207:4362`.
 * Replace with RTK Query once the API exists — shapes match the card props already built.
 */
export const HOME_POPULAR = [
  'Riyadh Season',
  'Football',
  'AlUla',
  'Comedy nights',
  'Family days',
] as const

export const HOME_FEATURED = [
  {
    date: 'Thu 8 Oct · 20:00',
    title: 'Riyadh Season Opening Night',
    venue: 'Boulevard Riyadh City',
    rating: '4.8',
    price: 'SAR 180',
    category: 'Concerts',
    flag: 'Nearly sold out',
  },
  {
    date: 'Thu 22 Oct — 3 days',
    title: 'Soundstorm Festival',
    venue: 'Banban, Riyadh',
    rating: '4.9',
    price: 'SAR 450',
    category: 'Festivals',
  },
] as const

export const HOME_TALENTS = [
  {
    name: 'Layal Qasim',
    discipline: 'Singer · Arabic pop',
    rating: '4.9',
    reviews: '128',
    city: 'Riyadh',
    nextLabel: 'Next · Thu 8 Oct',
    nextEvent: 'Riyadh Season Opening Night',
    verified: true,
  },
  {
    name: 'Tarek Al-Nasser',
    discipline: 'Oud · Traditional',
    rating: '4.8',
    reviews: '94',
    city: 'Jeddah',
    nextLabel: 'Next · Sat 17 Oct',
    nextEvent: 'Jeddah Nights at Al-Balad',
    verified: true,
  },
  {
    name: 'Nada Sharif',
    discipline: 'DJ · Electronic',
    rating: '4.7',
    reviews: '211',
    city: 'Riyadh',
    nextLabel: 'Next · Thu 22 Oct',
    nextEvent: 'Soundstorm Festival',
    verified: false,
  },
  {
    name: 'Faisal Bin Omar',
    discipline: 'Comedy · Stand-up',
    rating: '4.9',
    reviews: '76',
    city: 'Dammam',
    nextLabel: 'Next · Today',
    nextEvent: 'Riyadh Comedy Club',
    verified: true,
  },
  {
    name: 'Sarah Halabi',
    discipline: 'Speaker · Business',
    rating: '5.0',
    reviews: '43',
    city: 'Riyadh',
    nextLabel: 'Next · Tue 13 Oct',
    nextEvent: 'Future Investment Forum',
    verified: true,
  },
] as const

export const HOME_CATEGORIES = [
  { label: 'Music', count: 214 },
  { label: 'Concerts', count: 168 },
  { label: 'Festivals', count: 92 },
  { label: 'Sports', count: 143 },
  { label: 'Theatre & Arts', count: 71 },
  { label: 'Comedy', count: 38 },
  { label: 'Conferences', count: 126 },
  { label: 'Workshops', count: 88 },
  { label: 'Exhibitions', count: 54 },
  { label: 'Family & Children', count: 97 },
  { label: 'Food & Drink', count: 62 },
  { label: 'Religious', count: 29 },
] as const

export const HOME_EVENT_TABS = [
  'All',
  'Today',
  'This week',
  'This weekend',
  'This month',
] as const

/** Fixture “today” for Home time-tab filtering (not live calendar). */
export type HomeEventWindow = 'today' | 'week' | 'weekend' | 'month'

export const HOME_EVENTS = [
  {
    date: 'Thu 8 Oct · 20:00',
    title: 'Winter Nights: Live at King Abdullah Park',
    venue: 'King Abdullah Park, Riyadh',
    rating: '4.8',
    attendance: '3,410 attending',
    price: 'SAR 180',
    category: 'Concerts',
    flag: 'Nearly sold out',
    window: 'week' as HomeEventWindow,
  },
  {
    date: 'Fri 9 Oct · 21:00',
    title: 'Al-Hilal vs Al-Nassr — Saudi Pro League',
    venue: 'Kingdom Arena, Riyadh',
    rating: '4.9',
    attendance: '24,880 attending',
    price: 'SAR 240',
    category: 'Sports',
    window: 'weekend' as HomeEventWindow,
  },
  {
    date: 'Sat 10 Oct · 16:00',
    title: 'Jeddah Season Food Festival',
    venue: 'Jeddah Waterfront',
    rating: '4.6',
    attendance: '8,120 attending',
    price: 'SAR 60',
    category: 'Food & Drink',
    window: 'weekend' as HomeEventWindow,
  },
  {
    date: 'Tue 13 Oct · 09:00',
    title: 'Future Investment Forum 2026',
    venue: 'Ritz-Carlton, Riyadh',
    rating: '4.7',
    attendance: '1,940 attending',
    price: 'SAR 1,200',
    category: 'Conferences',
    window: 'week' as HomeEventWindow,
  },
  {
    date: 'Today · 19:30',
    title: 'AlUla Sky Lantern Evening',
    venue: 'AlUla Old Town',
    rating: '4.9',
    attendance: '1,105 attending',
    price: 'SAR 150',
    category: 'Cultural',
    flag: 'Today',
    window: 'today' as HomeEventWindow,
  },
  {
    date: 'Sat 10 Oct · 15:00',
    title: 'Diriyah E-Prix — Race Weekend',
    venue: 'Diriyah Street Circuit',
    rating: '4.8',
    attendance: '12,300 attending',
    price: 'SAR 320',
    category: 'Motorsport',
    window: 'weekend' as HomeEventWindow,
  },
  {
    date: 'Sun 11 Oct · 10:00',
    title: 'Kids Science Lab: Build a Rover',
    venue: 'Ithra, Dhahran',
    rating: '4.7',
    attendance: '480 attending',
    price: 'SAR 45',
    category: 'Family & Children',
    window: 'weekend' as HomeEventWindow,
  },
  {
    date: 'Today · 21:30',
    title: 'Stand-up Night: Riyadh Comedy Club',
    venue: 'Boulevard City, Riyadh',
    rating: '4.5',
    attendance: '620 attending',
    price: 'SAR 95',
    category: 'Comedy',
    flag: 'Today',
    window: 'today' as HomeEventWindow,
  },
] as const

export const HOME_FEATURED_PANELS = [
  {
    date: 'Thu 22 Oct — 3 days',
    title: 'Soundstorm Festival',
    venue: 'Banban, Riyadh',
    price: 'From SAR 450',
    meta: '4.9 · 180k going',
  },
  {
    date: 'Sat 24 Oct · 20:00',
    title: 'Saudi Super Cup Final',
    venue: 'Kingdom Arena, Riyadh',
    price: 'From SAR 300',
    meta: '4.8 · 22k going',
  },
  {
    date: 'Wed 4 Nov — 9 days',
    title: 'Red Sea Film Festival',
    venue: 'Al-Balad, Jeddah',
    price: 'From SAR 120',
    meta: '4.7 · 31k going',
  },
] as const

/** `endsIn` is the clock alone — AuctionCard draws the "Ends in" prefix. */
export const HOME_AUCTIONS = [
  {
    listings: '12 listings',
    endsIn: '02:41:18',
    title: 'Winter Nights: Live at King Abdullah Park',
    meta: 'Riyadh · Thu 8 Oct',
    highestBid: 'SAR 220',
    buyNow: 'SAR 340',
  },
  {
    listings: '38 listings',
    endsIn: '05:12:04',
    title: 'Al-Hilal vs Al-Nassr',
    meta: 'Kingdom Arena · Fri 9 Oct',
    highestBid: 'SAR 410',
    buyNow: 'SAR 600',
  },
  {
    listings: '7 listings',
    endsIn: '11:58:33',
    title: 'Soundstorm Festival — 3 day pass',
    meta: 'Banban · Thu 22 Oct',
    highestBid: 'SAR 520',
    buyNow: '—',
  },
  {
    listings: '4 listings',
    endsIn: '22:07:51',
    title: 'Diriyah E-Prix Grandstand',
    meta: 'Diriyah · Sat 10 Oct',
    highestBid: 'SAR 290',
    buyNow: 'SAR 395',
  },
] as const

export const HOME_EXPERIENCES = [
  {
    title: 'Edge of the World',
    location: 'Riyadh Region',
    category: 'Nature',
    summary:
      'Cliff-edge desert escarpment 90 minutes from Riyadh. Guided tours, 4x4 transfer, sunset viewing.',
    rating: '4.9',
    reviews: '1,204 reviews',
  },
  {
    title: 'Al-Balad Historic Jeddah',
    location: 'Jeddah, Makkah Region',
    category: 'Heritage',
    summary: 'UNESCO-listed old town. Coral houses, souqs, walking tours and cafés.',
    rating: '4.8',
    reviews: '876 reviews',
  },
  {
    title: 'Hegra Archaeological Site',
    location: 'AlUla, Madinah Region',
    category: 'Heritage',
    summary: 'Nabataean tombs carved into sandstone. Rawi guides, vintage Land Rover tours.',
    rating: '5.0',
    reviews: '2,140 reviews',
  },
  {
    title: 'Farasan Islands',
    location: 'Jazan Region',
    category: 'Nature',
    summary:
      'Coral archipelago in the Red Sea. Diving, birdwatching, ferry access from Jazan port.',
    rating: '4.7',
    reviews: '412 reviews',
  },
] as const
