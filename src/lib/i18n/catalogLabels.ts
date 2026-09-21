import type { TFunction } from 'i18next'

/** English fixture / API chrome labels → catalog JSON keys. */
const LABEL_KEYS: Record<string, string> = {
  Featured: 'badges.featured',
  'Nearly sold out': 'badges.nearlySoldOut',
  'Nearly sold out · 8% left': 'badges.nearlySoldOutLeft',
  '18+': 'badges.age18',
  'Sold out': 'badges.soldOut',
  'All events': 'filters.allEvents',
  'Any date': 'filters.anyDate',
  Today: 'filters.today',
  'This week': 'filters.thisWeek',
  Weekend: 'filters.weekend',
  'This month': 'filters.thisMonth',
  Anytime: 'filters.anytime',
  'Next 3 months': 'filters.next3Months',
  Any: 'filters.any',
  'Free entry only': 'filters.freeEntryOnly',
  'Free seating': 'filters.freeSeating',
  'Assigned seating': 'filters.assignedSeating',
  'Free cancellation': 'filters.freeCancellation',
  'Family friendly': 'filters.familyFriendly',
  'Accessible seating': 'filters.accessibleSeating',
  'Instant e-ticket': 'filters.instantETicket',
  'Ending soon': 'filters.endingSoon',
  'Under face value': 'filters.underFaceValue',
  'Seats together': 'filters.seatsTogether',
  'My watchlist': 'filters.myWatchlist',
  'Anywhere in Saudi Arabia': 'filters.anywhereSaudi',
  Free: 'filters.free',
  'Under SAR 200': 'filters.underSar200',
  'SAR 200–500': 'filters.sar200to500',
  'SAR 500+': 'filters.sar500plus',
  Families: 'filters.families',
  'Date night': 'filters.dateNight',
  Groups: 'filters.groups',
  'First-timers': 'filters.firstTimers',
  'Any time': 'filters.anyTime',
  Concerts: 'categories.concerts',
  Music: 'categories.music',
  Festivals: 'categories.festivals',
  Sports: 'categories.sports',
  'Theatre & Arts': 'categories.theatreArts',
  Comedy: 'categories.comedy',
  Conferences: 'categories.conferences',
  Workshops: 'categories.workshops',
  Exhibitions: 'categories.exhibitions',
  'Family & Children': 'categories.familyChildren',
  'Food & Drink': 'categories.foodDrink',
  Cultural: 'categories.cultural',
  Religious: 'categories.religious',
  'All talents': 'categories.allTalents',
  Singers: 'categories.singers',
  Bands: 'categories.bands',
  DJs: 'categories.djs',
  Musicians: 'categories.musicians',
  Speakers: 'categories.speakers',
  Comedians: 'categories.comedians',
  Hosts: 'categories.hosts',
  'Dance troupes': 'categories.danceTroupes',
  'All experiences': 'categories.allExperiences',
  'Food & desert': 'categories.foodDesert',
  Culture: 'categories.culture',
  Heritage: 'categories.heritage',
  Outdoors: 'categories.outdoors',
  'All Saudi Arabia': 'home.regions.all',
  Riyadh: 'home.regions.riyadh',
  Jeddah: 'home.regions.jeddah',
  Dammam: 'home.regions.dammam',
  Khobar: 'home.regions.khobar',
  AlUla: 'home.regions.alula',
  Abha: 'home.regions.abha',
  All: 'home.timeTabs.all',
  'This weekend': 'home.timeTabs.thisWeekend',
}

/** Translate known catalog chrome labels; leave unknown (content) labels as-is. */
export function catalogLabel(t: TFunction, label: string): string {
  const trimmed = label.trim()
  if (!trimmed) return trimmed

  const caseMatch = Object.keys(LABEL_KEYS).find(
    (k) => k.toLowerCase() === trimmed.toLowerCase(),
  )
  const exact = LABEL_KEYS[trimmed] ?? (caseMatch ? LABEL_KEYS[caseMatch] : undefined)
  if (exact) return String(t(exact))

  // "Nearly sold out · …" / similar urgency badges
  if (/^nearly sold out/i.test(trimmed)) {
    return String(t('badges.nearlySoldOut'))
  }

  // Slug-ish API categories: "concerts", "theatre_arts", "food-drink"
  const slug = trimmed.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ')
  const slugMatch = Object.keys(LABEL_KEYS).find((k) => k.toLowerCase() === slug)
  if (slugMatch) return String(t(LABEL_KEYS[slugMatch]!))

  return trimmed
}
