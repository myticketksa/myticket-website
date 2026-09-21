/**
 * Phosphor stand-ins for glyphs the MyTicket set does not draw.
 *
 * The custom set in `207:1595` covers only twelve glyphs. The screens reference
 * many more (chevrons, arrows, close, check, share, filter, and so on), and
 * Figma's icon page `207:3385` names Phosphor as the source for those. Weight
 * `regular` is the closest match to the custom set's 2px stroke on a 24 grid.
 *
 * Everything is re-exported through one module so a later swap to a first-party
 * glyph is a one-line change here rather than an edit across every screen.
 */
export {
  // direction (vertical only — horizontal arrows live in `directional.tsx`)
  CaretDown as ChevronDownIcon,
  CaretUp as ChevronUpIcon,
  ArrowUpRight as ArrowUpRightIcon,

  // actions
  X as CloseIcon,
  Check as CheckIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  ShareNetwork as ShareIcon,
  Funnel as FilterIcon,
  SlidersHorizontal as SortIcon,
  Trash as TrashIcon,
  PencilSimple as EditIcon,
  Copy as CopyIcon,
  DownloadSimple as DownloadIcon,
  UploadSimple as UploadIcon,
  MagnifyingGlass as MagnifyingGlassIcon,
  DotsThree as MoreIcon,
  List as MenuIcon,

  // status and feedback
  Info as InfoIcon,
  Warning as WarningIcon,
  WarningCircle as ErrorIcon,
  CheckCircle as SuccessIcon,
  Question as HelpIcon,
  Eye as EyeIcon,
  EyeSlash as EyeOffIcon,

  // commerce and content
  Wallet as WalletIcon,
  CreditCard as CreditCardIcon,
  Tag as TagIcon,
  Gavel as GavelIcon,
  QrCode as QrCodeIcon,
  Receipt as ReceiptIcon,
  Users as UsersIcon,
  Buildings as BuildingsIcon,
  Storefront as StorefrontIcon,
  MusicNotes as MusicNotesIcon,
  Microphone as MicrophoneIcon,
  Camera as CameraIcon,
  Chat as ChatIcon,
  EnvelopeSimple as MailIcon,
  Phone as PhoneIcon,
  PaperPlaneTilt as PaperPlaneIcon,
  Star as StarOutlineIcon,
  Globe as GlobeIcon,
  GlobeHemisphereEast as GlobeEastIcon,
  Gear as SettingsIcon,
  SignOut as SignOutIcon,
  ShieldCheck as ShieldIcon,
  LockKey as LockIcon,
  BellRinging as BellRingingIcon,
  Power as PowerIcon,
  Briefcase as BriefcaseIcon,
  Bookmark as BookmarkIcon,
  Sparkle as SparkleIcon,
  ArrowDown as ArrowDownIcon,
  ArrowUp as ArrowUpIcon,
  ArrowCounterClockwise as ArrowCounterClockwiseIcon,
  HourglassMedium as HourglassIcon,
  UserCircle as UserCircleIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Image as ImageIcon,
} from '@phosphor-icons/react'
