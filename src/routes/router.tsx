import { createBrowserRouter, Outlet } from 'react-router-dom'
import {
  MainLayout,
  AuthLayout,
  AccountLayout,
  PurchaseLayout,
  FunnelLayout,
} from '@/layouts'
import { SiteDocumentMeta } from '@/components/navigation'
import { ProbeRoute } from './ProbeRoute'
import { RouteErrorPage } from './RouteErrorPage'
import {
  HomePage,
  EventsPage,
  EventDetailPage,
  SearchResultsPage,
  TalentsPage,
  TalentDetailPage,
  ExperiencesPage,
  ExperienceDetailPage,
  SeatSelectionPage,
  CheckoutPage,
  OrderConfirmationPage,
  SignInPage,
  RegisterPage,
  ResetPasswordPage,
  ProfilePage,
  SettingsPage,
  MyTicketsPage,
  TicketPage,
  FavoritesPage,
  NotificationsPage,
  WalletPage,
  MyReviewsPage,
  MySubmissionsPage,
  MyVendorApplicationPage,
  MyTalentApplicationPage,
  GiftTicketPage,
  ClaimGiftPage,
  SubmitExperiencePage,
  BecomeBusinessPage,
  ApplyVendorPage,
  ApplyTalentPage,
  ApplicationSubmittedPage,
  MySupportCasesPage,
  NewSupportCasePage,
  SupportChatPage,
  AboutPage,
  HelpPage,
  LegalPage,
  MaintenancePage,
  NotFoundPage,
} from '@/pages'

/**
 * Route table from docs/reference/implementation-guide.md §3, wired to the four layout
 * patterns in docs/design-system/LAYOUT-ARCHITECTURE.md.
 *
 * `/probe` is the temporary component harness — keep it until Visual QA lands.
 */
function RootDocument() {
  return (
    <>
      <SiteDocumentMeta />
      <Outlet />
    </>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootDocument />,
    /** Covers the entire route tree — render / navigation failures report to StackLogger. */
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: '/probe',
        element: <ProbeRoute />,
      },
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/events', element: <EventsPage /> },
          { path: '/events/:slug', element: <EventDetailPage /> },
          { path: '/search', element: <SearchResultsPage /> },
          { path: '/talents', element: <TalentsPage /> },
          { path: '/talents/:slug', element: <TalentDetailPage /> },
          { path: '/experiences', element: <ExperiencesPage /> },
          { path: '/experiences/:slug', element: <ExperienceDetailPage /> },
          { path: '/order-confirmation', element: <OrderConfirmationPage /> },
          { path: '/become-business', element: <BecomeBusinessPage /> },
          { path: '/about', element: <AboutPage /> },
          { path: '/help', element: <HelpPage /> },
          { path: '/legal', element: <LegalPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        path: '/maintenance',
        element: <MaintenancePage />,
      },
      {
        element: <AuthLayout />,
        children: [
          { path: '/sign-in', element: <SignInPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/reset-password', element: <ResetPasswordPage /> },
        ],
      },
      {
        element: <AccountLayout />,
        children: [
          { path: '/profile', element: <ProfilePage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/my-tickets', element: <MyTicketsPage /> },
          { path: '/favorites', element: <FavoritesPage /> },
          { path: '/saved', element: <FavoritesPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/wallet', element: <WalletPage /> },
          { path: '/my-reviews', element: <MyReviewsPage /> },
          { path: '/my-submissions', element: <MySubmissionsPage /> },
          { path: '/my-vendor-application', element: <MyVendorApplicationPage /> },
          { path: '/my-talent-application', element: <MyTalentApplicationPage /> },
          { path: '/support', element: <MySupportCasesPage /> },
        ],
      },
      {
        element: <FunnelLayout />,
        children: [
          { path: '/my-tickets/:id', element: <TicketPage /> },
          { path: '/my-tickets/:id/gift', element: <GiftTicketPage /> },
          { path: '/gift/claim/:giftTicketId', element: <ClaimGiftPage /> },
          { path: '/support/new', element: <NewSupportCasePage /> },
          { path: '/support/chat', element: <SupportChatPage /> },
          { path: '/apply/vendor', element: <ApplyVendorPage /> },
          { path: '/apply/talent', element: <ApplyTalentPage /> },
          { path: '/submit-experience', element: <SubmitExperiencePage /> },
          { path: '/application-submitted', element: <ApplicationSubmittedPage /> },
        ],
      },
      {
        element: <PurchaseLayout />,
        children: [
          { path: '/events/:slug/seats', element: <SeatSelectionPage /> },
          { path: '/checkout', element: <CheckoutPage /> },
        ],
      },
    ],
  },
])
