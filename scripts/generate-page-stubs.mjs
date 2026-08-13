/**
 * Generates page stub modules from the route table in docs/reference/implementation-guide.md.
 * Run: node scripts/generate-page-stubs.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const pages = [
  // Public / Browse — MainLayout
  { name: 'HomePage', file: 'home/HomePage.tsx', title: 'Home', figma: '207:4362', layout: 'main' },
  { name: 'EventsPage', file: 'events/EventsPage.tsx', title: 'Events', figma: '207:4600', layout: 'main' },
  { name: 'EventDetailPage', file: 'events/EventDetailPage.tsx', title: 'Event detail', figma: '207:4797', layout: 'main' },
  { name: 'SearchResultsPage', file: 'search/SearchResultsPage.tsx', title: 'Search results', figma: '207:5205', layout: 'main' },
  { name: 'TalentsPage', file: 'talents/TalentsPage.tsx', title: 'Talents', figma: '207:5539', layout: 'main' },
  { name: 'TalentDetailPage', file: 'talents/TalentDetailPage.tsx', title: 'Talent detail', figma: '207:5726', layout: 'main' },
  { name: 'ExperiencesPage', file: 'experiences/ExperiencesPage.tsx', title: 'Experiences', figma: '207:6795', layout: 'main' },
  { name: 'ExperienceDetailPage', file: 'experiences/ExperienceDetailPage.tsx', title: 'Experience detail', figma: '207:7048', layout: 'main' },
  { name: 'VendorsPage', file: 'vendors/VendorsPage.tsx', title: 'Vendors', figma: '207:5992', layout: 'main' },
  { name: 'VendorDetailPage', file: 'vendors/VendorDetailPage.tsx', title: 'Vendor detail', figma: '207:6338', layout: 'main' },
  { name: 'OrganizersPage', file: 'organizers/OrganizersPage.tsx', title: 'Organizers', figma: '207:6112', layout: 'main' },
  { name: 'OrganizerDetailPage', file: 'organizers/OrganizerDetailPage.tsx', title: 'Organizer detail', figma: '207:6154', layout: 'main' },
  { name: 'AuctionPage', file: 'auctions/AuctionPage.tsx', title: 'Auctions', figma: '207:10792', layout: 'main' },
  { name: 'AuctionEventPage', file: 'auctions/AuctionEventPage.tsx', title: 'Auction event', figma: '207:11616', layout: 'main' },
  { name: 'OrderConfirmationPage', file: 'checkout/OrderConfirmationPage.tsx', title: 'Order confirmation', figma: '207:8462', layout: 'main' },

  // Booking — PurchaseLayout
  { name: 'SeatSelectionPage', file: 'checkout/SeatSelectionPage.tsx', title: 'Seat selection', figma: '207:7446', layout: 'purchase' },
  { name: 'CheckoutPage', file: 'checkout/CheckoutPage.tsx', title: 'Checkout', figma: '207:8228', layout: 'purchase' },

  // Auth — AuthLayout
  { name: 'SignInPage', file: 'auth/SignInPage.tsx', title: 'Sign in', figma: '207:11907', layout: 'auth' },
  { name: 'RegisterPage', file: 'auth/RegisterPage.tsx', title: 'Create account', figma: '207:11849', layout: 'auth' },
  { name: 'ResetPasswordPage', file: 'auth/ResetPasswordPage.tsx', title: 'Reset password', figma: '207:11297', layout: 'auth' },

  // Account — AccountLayout
  { name: 'ProfilePage', file: 'account/ProfilePage.tsx', title: 'Profile', figma: '207:10412', layout: 'account' },
  { name: 'SettingsPage', file: 'account/SettingsPage.tsx', title: 'Settings', figma: '207:10247', layout: 'account' },
  { name: 'MyTicketsPage', file: 'account/MyTicketsPage.tsx', title: 'My tickets', figma: '207:9469', layout: 'account' },
  { name: 'TicketPage', file: 'account/TicketPage.tsx', title: 'Ticket', figma: '207:9024', layout: 'account' },
  { name: 'SavedPage', file: 'account/SavedPage.tsx', title: 'Saved', figma: '207:8057', layout: 'account' },
  { name: 'NotificationsPage', file: 'account/NotificationsPage.tsx', title: 'Notifications', figma: '207:8824', layout: 'account' },
  { name: 'WalletPage', file: 'account/WalletPage.tsx', title: 'Wallet', figma: '207:11086', layout: 'account' },
  { name: 'MyReviewsPage', file: 'account/MyReviewsPage.tsx', title: 'My reviews', figma: '207:9974', layout: 'account' },
  { name: 'MyEnquiriesPage', file: 'account/MyEnquiriesPage.tsx', title: 'My enquiries', figma: '207:6603', layout: 'account' },
  { name: 'MySubmissionsPage', file: 'account/MySubmissionsPage.tsx', title: 'My submissions', figma: '207:7362', layout: 'account' },
  { name: 'MyAuctionActivityPage', file: 'account/MyAuctionActivityPage.tsx', title: 'My auction activity', figma: '207:11538', layout: 'account' },
  { name: 'ResellTicketPage', file: 'account/ResellTicketPage.tsx', title: 'Resell ticket', figma: '207:9700', layout: 'account' },
  { name: 'GiftTicketPage', file: 'account/GiftTicketPage.tsx', title: 'Gift ticket', figma: '207:9806', layout: 'account' },
  { name: 'RefundRequestPage', file: 'account/RefundRequestPage.tsx', title: 'Refund request', figma: '207:9879', layout: 'account' },
  { name: 'MySupportCasesPage', file: 'support/MySupportCasesPage.tsx', title: 'Support cases', figma: '207:10155', layout: 'account' },
  { name: 'NewSupportCasePage', file: 'support/NewSupportCasePage.tsx', title: 'New support case', figma: '207:11781', layout: 'account' },
  { name: 'SupportChatPage', file: 'support/SupportChatPage.tsx', title: 'Support chat', figma: '207:12302', layout: 'account' },

  // Forms / marketing — MainLayout
  { name: 'SubmitExperiencePage', file: 'forms/SubmitExperiencePage.tsx', title: 'Submit experience', figma: '207:6961', layout: 'main' },
  { name: 'BecomeBusinessPage', file: 'forms/BecomeBusinessPage.tsx', title: 'Become a business', figma: '207:10047', layout: 'main' },
  { name: 'ApplyVendorPage', file: 'forms/ApplyVendorPage.tsx', title: 'Apply as vendor', figma: '207:11368', layout: 'main' },
  { name: 'ApplyOrganizerPage', file: 'forms/ApplyOrganizerPage.tsx', title: 'Apply as organizer', figma: '207:11424', layout: 'main' },
  { name: 'ApplyTalentPage', file: 'forms/ApplyTalentPage.tsx', title: 'Apply as talent', figma: '207:11482', layout: 'main' },
  { name: 'ApplicationSubmittedPage', file: 'forms/ApplicationSubmittedPage.tsx', title: 'Application submitted', figma: '207:11329', layout: 'main' },
  { name: 'AboutPage', file: 'marketing/AboutPage.tsx', title: 'About MyTicket', figma: '207:11984', layout: 'main' },
  { name: 'HelpPage', file: 'marketing/HelpPage.tsx', title: 'Help centre', figma: '207:12147', layout: 'main' },
  { name: 'LegalPage', file: 'marketing/LegalPage.tsx', title: 'Legal', figma: '207:12042', layout: 'main' },
  { name: 'ForVendorsPage', file: 'marketing/ForVendorsPage.tsx', title: 'For vendors', figma: '207:12388', layout: 'main' },
  { name: 'ForOrganizersPage', file: 'marketing/ForOrganizersPage.tsx', title: 'For organizers', figma: '207:12611', layout: 'main' },
  { name: 'ForTalentsPage', file: 'marketing/ForTalentsPage.tsx', title: 'For talents', figma: '207:12768', layout: 'main' },
  { name: 'MaintenancePage', file: 'system/MaintenancePage.tsx', title: 'Maintenance', figma: '207:12106', layout: 'main' },
  { name: 'NotFoundPage', file: 'system/NotFoundPage.tsx', title: 'Not found', figma: '207:12542', layout: 'main' },
]

const root = path.resolve('src/pages')

function stub({ name, title, figma }) {
  return `import { PageStub } from '@/pages/_PageStub'

/** Stub for Figma node \`${figma}\`. Replace section by section when this screen is built. */
export function ${name}() {
  return <PageStub title="${title}" figmaNode="${figma}" />
}
`
}

for (const page of pages) {
  const full = path.join(root, page.file)
  mkdirSync(path.dirname(full), { recursive: true })
  writeFileSync(full, stub(page))
}

writeFileSync(
  path.join(root, 'index.ts'),
  `// Generated by scripts/generate-page-stubs.mjs — re-run after adding screens.\n${pages
    .map((p) => {
      const mod = './' + p.file.replace(/\.tsx$/, '')
      return `export { ${p.name} } from '${mod}'`
    })
    .join('\n')}\n`,
)

console.log(`Generated ${pages.length} page stubs`)
