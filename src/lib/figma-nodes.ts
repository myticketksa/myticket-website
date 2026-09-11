/**
 * Figma source-of-truth references.
 *
 * The original file (MvbBN5eknD2xUD5LhUBeBS) could not be read over MCP because
 * the account holds only a View seat in its owning team. It was duplicated into
 * the Pro team, which preserved every node id — only the file key changed.
 */
export const FIGMA_FILE_KEY = 'yffYsbbooJbCZMYbAWSMfH'

export const FIGMA_PAGES = {
  guests: '0:1',
  designSystem: '86:962',
  showcase: '73:962',
} as const

/** Foundation documentation frames, the source of the token layer. */
export const FIGMA_FOUNDATIONS = {
  colour: '207:1909',
  typography: '207:2279',
  shapeElevationIcons: '207:2519',
} as const

/** Design-system component nodes, verified against get_metadata on 86:962. */
export const FIGMA_COMPONENTS = {
  // inputs and controls
  Button: '207:1630',
  ButtonStateCardCta: '207:1687',
  TextInput: '207:1689',
  Select: '207:1698',
  Textarea: '207:1700',
  FieldLabel: '207:1702',
  InlineError: '207:1704',
  CharacterCounter: '207:1706',
  SearchField: '207:1708',
  Checkbox: '207:1717',
  Radio: '207:1727',
  Toggle: '207:1734',
  OTPBox: '207:1743',
  OTPGroup: '207:2868',
  AmountInput: '207:1747',

  // data display
  StatusBadge: '207:1750',
  FilterChip: '207:1769',
  OverlayBadge: '207:1783',
  VersionPill: '207:1789',
  AttributeTag: '207:1791',
  LanguagePill: '207:1793',
  CountBadge: '207:1795',
  Avatar: '207:1800',
  Skeleton: '207:1809',
  Divider: '207:1812',
  MeterBar: '207:1815',
  StarRating: '207:1817',
  PriceDisplay: '207:1827',
  Countdown: '207:1840',
  ImagePlaceholder: '207:1845',
  Spinner: '207:1852',

  // data blocks
  SpecPanel: '207:2856',
  KeyValueRow: '207:2860',
  BulletRow: '207:2863',
  FacetList: '207:2865',
  MoneySummary: '207:3049',
  RatingSummary: '207:3061',
  StatCard: '207:3085',
  ListRow: '207:3091',

  // cards
  TalentCard: '207:3100',
  TalentCardDirectory: '207:3139',
  ExperienceCard: '207:3166',
  EventCard: '207:3254',
  EventCardCatalog: '207:3276',
  FeaturedHeroCard: '207:3194',
  FeaturedPanelCard: '207:3220',
  AuctionCard: '207:3235',
  CategoryChip: '207:3097',
  LoadingCard: '207:2920',

  // navigation and layout
  SiteHeader: '207:2936',
  SiteFooter: '207:2977',
  NavItem: '207:2926',
  Tabs: '207:2841',
  Breadcrumbs: '207:2835',
  Pagination: '207:2852',
  SectionHeader: '207:2818',
  SearchPill: '207:2933',
  Logo: '207:3096', // favicon mark cropped from this lockup

  // feedback and overlays
  Toast: '207:2875',
  DeadlineBanner: '207:2895',
  EmptyState: '207:2901',
  Modal: '207:3040',
  ModalScrim: '207:3048',
} as const

/** Screen frames from the Guests page, keyed by route path. */
export const FIGMA_SCREENS = {
  '/': '207:4362',
  '/events': '207:4600',
  '/events/:slug': '207:4797',
  '/search': '207:5205',
  '/talents': '207:5539',
  '/talents/:slug': '207:5726',
  '/experiences': '207:6795',
  '/experiences/:slug': '207:7048',
  '/auctions': '207:10792',
  '/auctions/:slug': '207:11616',
  '/events/:slug/seats': '207:7446',
  '/checkout': '207:8228',
  '/order-confirmation': '207:8462',
  '/sign-in': '207:11907',
  '/register': '207:11849',
  '/reset-password': '207:11297',
  '/profile': '207:10412',
  '/settings': '207:10247',
  '/my-tickets': '207:9469',
  '/my-tickets/:id': '207:9024',
  '/saved': '207:8057',
  '/notifications': '207:8824',
  '/wallet': '207:11086',
  '/my-reviews': '207:9974',
  '/my-submissions': '207:7362',
  '/my-auction-activity': '207:11538',
  '/my-tickets/:id/resell': '207:9700',
  '/my-tickets/:id/gift': '207:9806',
  '/my-tickets/:id/refund': '207:9879',
  '/submit-experience': '207:6961',
  '/become-business': '207:10047',
  '/apply/vendor': '207:11368',
  '/apply/organizer': '207:11424',
  '/apply/talent': '207:11482',
  '/application-submitted': '207:11329',
  '/support': '207:10155',
  '/support/new': '207:11781',
  '/support/chat': '207:12302',
  '/about': '207:11984',
  '/help': '207:12147',
  '/legal': '207:12042',
  '/for-vendors': '207:12388',
  '/for-organizers': '207:12611',
  '/for-talents': '207:12768',
  '/maintenance': '207:12106',
  '*': '207:12542',
} as const

/** Icon sets. */
export const FIGMA_ICON_SETS = {
  custom: '207:1595',
  phosphor: '207:3385',
} as const

export type FigmaComponentName = keyof typeof FIGMA_COMPONENTS
