# MyTicket — Figma-to-React Implementation Guide for Cursor AI

> **Source:** Figma file `MvbBN5eknD2xUD5LhUBeBS`
> **Generated:** August 2026
> **Purpose:** Give Cursor IDE's AI agent full context to implement the MyTicket design as a pixel-accurate React application.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [All Design Frames & Figma Links](#2-all-design-frames--figma-links)
3. [Routing Map](#3-routing-map)
4. [Design Tokens (CSS Variables)](#4-design-tokens-css-variables)
5. [Typography System](#5-typography-system)
6. [Component Library → React Components](#6-component-library--react-components)
7. [Icon System](#7-icon-system)
8. [Page Layout Architecture](#8-page-layout-architecture)
9. [Key Page Structures](#9-key-page-structures)
10. [Figma MCP Context for Cursor](#10-figma-mcp-context-for-cursor)
11. [Implementation Rules & Conventions](#11-implementation-rules--conventions)

---

## 1. Project Overview

**MyTicket** is a ticketing and events marketplace with three product surfaces:

| Surface | Description | Status |
|---------|-------------|--------|
| **MyTicket Guests** | Guest-facing web app (browse, book, manage tickets) | 51 screens designed |
| **MyTicket Business** | Business/admin dashboard | Planned (no screens yet) |
| **MyTicket Mobile App** | Native mobile app | Planned (no screens yet) |

**Design specs:**
- **Primary viewport:** 1440px desktop
- **Content width:** 1320px (1440 - 60px padding each side)
- **Layout system:** Vertical auto-layout, section-based
- **Font:** Manrope (single typeface, Google Fonts)
- **Palette direction:** Warm cream/peach canvas, burnt-orange brand, dark-brown ink

---

## 2. All Design Frames & Figma Links

### Guest Web App — 51 Screens

> Use these links with the [Figma MCP server](https://github.com/nicholasgriffintn/figma-mcp-server) in Cursor to fetch node-level design context per screen.

#### Core Pages

| # | Screen Name | Figma Link | Size | Sections |
|---|-------------|------------|------|----------|
| 1 | Home | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-4362) | 1440×6129 | Header, Hero, Talents, Categories, Events, Featured, Auction, Experiences, Organizers, Vendors, CTA, BusinessStrip, Footer |
| 2 | Events | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-4600) | 1440×2378 | |
| 3 | Event Details | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-4797) | 1440×3888 | Header, Breadcrumb, Gallery, Main, Similar, Footer |
| 4 | Search Results | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-5205) | 1440×2399 | |
| 5 | Talents | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-5539) | 1440×3236 | |
| 6 | Talent Detail | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-5726) | 1440×2576 | Header, Hero, Tabs, Body, Similar, Footer |
| 7 | Experiences | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-6795) | 1440×1900 | |
| 8 | Experience Detail | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-7048) | 1440×3254 | |
| 9 | Vendors | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-5992) | 1440×2517 | |
| 10 | Vendor Detail | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-6338) | 1440×2446 | |
| 11 | Organizers | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-6112) | 1440×1709 | |
| 12 | Organizer Detail | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-6154) | 1440×1786 | |
| 13 | Auction | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-10792) | 1440×2218 | |
| 14 | Auction Event | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-11616) | 1440×1596 | |
| 15 | About | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-11984) | 1440×1707 | |
| 16 | Help | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-12147) | 1440×2000 | |
| 17 | Legal | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-12042) | 1440×1999 | |

#### Booking & Purchase Flow

| # | Screen Name | Figma Link | Size |
|---|-------------|------------|------|
| 18 | Seat Selection | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-7446) | 1440×950 |
| 19 | Checkout | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-8228) | 1440×1446 |
| 20 | Order Confirmation | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-8462) | 1440×1559 |

#### Authentication

| # | Screen Name | Figma Link | Size | Layout |
|---|-------------|------------|------|--------|
| 21 | Sign In | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-11907) | 1440×910 | Split (50/50 horizontal) |
| 22 | Register | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-11849) | 1440×900 | Split (50/50 horizontal) |
| 23 | Reset Password | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-11297) | 1440×900 | |

#### User Dashboard / Account

| # | Screen Name | Figma Link | Size |
|---|-------------|------------|------|
| 24 | Profile | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-10412) | 1440×2544 |
| 25 | Settings | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-10247) | 1440×1727 |
| 26 | My Tickets | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-9469) | 1440×1807 |
| 27 | Ticket (single) | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-9024) | 1440×1160 |
| 28 | Saved | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-8057) | 1440×1554 |
| 29 | Notifications | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-8824) | 1440×2080 |
| 30 | Wallet | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-11086) | 1440×1655 |
| 31 | My Reviews | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-9974) | 1440×1180 |
| 32 | My Enquiries | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-6603) | 1440×1838 |
| 33 | My Submissions | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-7362) | 1440×1381 |
| 34 | My Auction Activity | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-11538) | 1440×1090 |

#### Ticket Management

| # | Screen Name | Figma Link | Size |
|---|-------------|------------|------|
| 35 | Resell Ticket | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-9700) | 1440×1448 |
| 36 | Gift Ticket | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-9806) | 1440×1296 |
| 37 | Refund Request | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-9879) | 1440×1409 |

#### Forms & Applications

| # | Screen Name | Figma Link | Size |
|---|-------------|------------|------|
| 38 | Submit Experience | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-6961) | 1440×1548 |
| 39 | Become a Business | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-10047) | 1440×1445 |
| 40 | Apply Vendor | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-11368) | 1440×1064 |
| 41 | Apply Organizer | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-11424) | 1440×1118 |
| 42 | Apply Talent | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-11482) | 1440×1064 |
| 43 | Application Submitted | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-11329) | 1440×1201 |

#### Support

| # | Screen Name | Figma Link | Size |
|---|-------------|------------|------|
| 44 | My Support Cases | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-10155) | 1440×1313 |
| 45 | New Support Case | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-11781) | 1440×1409 |
| 46 | Support Chat | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-12302) | 1440×1273 |

#### Landing / Marketing Pages

| # | Screen Name | Figma Link | Size |
|---|-------------|------------|------|
| 47 | For Vendors | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-12388) | 1440×2747 |
| 48 | For Organizers | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-12611) | 1440×2770 |
| 49 | For Talents | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-12768) | 1440×2747 |

#### Error & Utility

| # | Screen Name | Figma Link | Size |
|---|-------------|------------|------|
| 50 | Not Found (404) | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-12542) | 1440×1084 |
| 51 | Error (500) | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-12122) | 1440×900 |
| 52 | Maintenance | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-12106) | 1440×900 |

### Design System Page

| # | Element | Figma Link | Type |
|---|---------|------------|------|
| DS1 | Icons (Custom) | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-1595) | Section |
| DS2 | Button | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-1630) | Component Set |
| DS3 | TextInput | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-1689) | Component Set |
| DS4 | SearchField | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-1708) | Component Set |
| DS5 | Checkbox | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-1717) | Component Set |
| DS6 | Radio | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-1727) | Component Set |
| DS7 | Toggle | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-1734) | Component Set |
| DS8 | StatusBadge | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-1750) | Component Set |
| DS9 | FilterChip | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-1769) | Component Set |
| DS10 | Avatar | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-1800) | Component Set |
| DS11 | Toast | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-2875) | Component Set |
| DS12 | SiteHeader | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-2936) | Component Set |
| DS13 | SiteFooter | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-2977) | Component Set |
| DS14 | TalentCard | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-3100) | Component Set |
| DS15 | EventCard | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-3254) | Component Set |
| DS16 | VendorCard | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-3302) | Component Set |
| DS17 | Foundations — Colour | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-1909) | Documentation |
| DS18 | Foundations — Typography | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-2279) | Documentation |
| DS19 | Foundations — Shape & Icons | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-2519) | Documentation |
| DS20 | Icons — Phosphor | [Open in Figma](https://www.figma.com/design/MvbBN5eknD2xUD5LhUBeBS/?node-id=207-3385) | Frame |

---

## 3. Routing Map

Map each Figma screen to a React Router path:

```tsx
// src/routes.tsx
const routes = [
  // Public / Browse
  { path: "/",                     component: "HomePage",            figmaNode: "207-4362" },
  { path: "/events",              component: "EventsPage",           figmaNode: "207-4600" },
  { path: "/events/:slug",        component: "EventDetailPage",      figmaNode: "207-4797" },
  { path: "/search",              component: "SearchResultsPage",    figmaNode: "207-5205" },
  { path: "/talents",             component: "TalentsPage",          figmaNode: "207-5539" },
  { path: "/talents/:slug",       component: "TalentDetailPage",     figmaNode: "207-5726" },
  { path: "/experiences",         component: "ExperiencesPage",      figmaNode: "207-6795" },
  { path: "/experiences/:slug",   component: "ExperienceDetailPage", figmaNode: "207-7048" },
  { path: "/vendors",             component: "VendorsPage",          figmaNode: "207-5992" },
  { path: "/vendors/:slug",       component: "VendorDetailPage",     figmaNode: "207-6338" },
  { path: "/organizers",          component: "OrganizersPage",       figmaNode: "207-6112" },
  { path: "/organizers/:slug",    component: "OrganizerDetailPage",  figmaNode: "207-6154" },
  { path: "/auctions",            component: "AuctionPage",          figmaNode: "207-10792" },
  { path: "/auctions/:slug",      component: "AuctionEventPage",     figmaNode: "207-11616" },

  // Booking Flow
  { path: "/events/:slug/seats",  component: "SeatSelectionPage",    figmaNode: "207-7446" },
  { path: "/checkout",            component: "CheckoutPage",         figmaNode: "207-8228" },
  { path: "/order-confirmation",  component: "OrderConfirmationPage",figmaNode: "207-8462" },

  // Auth
  { path: "/sign-in",             component: "SignInPage",           figmaNode: "207-11907" },
  { path: "/register",            component: "RegisterPage",         figmaNode: "207-11849" },
  { path: "/reset-password",      component: "ResetPasswordPage",    figmaNode: "207-11297" },

  // User Account
  { path: "/profile",             component: "ProfilePage",          figmaNode: "207-10412" },
  { path: "/settings",            component: "SettingsPage",         figmaNode: "207-10247" },
  { path: "/my-tickets",          component: "MyTicketsPage",        figmaNode: "207-9469" },
  { path: "/my-tickets/:id",      component: "TicketPage",           figmaNode: "207-9024" },
  { path: "/saved",               component: "SavedPage",            figmaNode: "207-8057" },
  { path: "/notifications",       component: "NotificationsPage",    figmaNode: "207-8824" },
  { path: "/wallet",              component: "WalletPage",           figmaNode: "207-11086" },
  { path: "/my-reviews",          component: "MyReviewsPage",        figmaNode: "207-9974" },
  { path: "/my-enquiries",        component: "MyEnquiriesPage",      figmaNode: "207-6603" },
  { path: "/my-submissions",      component: "MySubmissionsPage",    figmaNode: "207-7362" },
  { path: "/my-auction-activity", component: "MyAuctionActivityPage",figmaNode: "207-11538" },

  // Ticket Actions
  { path: "/my-tickets/:id/resell",  component: "ResellTicketPage",  figmaNode: "207-9700" },
  { path: "/my-tickets/:id/gift",    component: "GiftTicketPage",    figmaNode: "207-9806" },
  { path: "/my-tickets/:id/refund",  component: "RefundRequestPage", figmaNode: "207-9879" },

  // Forms
  { path: "/submit-experience",   component: "SubmitExperiencePage", figmaNode: "207-6961" },
  { path: "/become-business",     component: "BecomeBusinessPage",   figmaNode: "207-10047" },
  { path: "/apply/vendor",        component: "ApplyVendorPage",      figmaNode: "207-11368" },
  { path: "/apply/organizer",     component: "ApplyOrganizerPage",   figmaNode: "207-11424" },
  { path: "/apply/talent",        component: "ApplyTalentPage",      figmaNode: "207-11482" },
  { path: "/application-submitted",component: "ApplicationSubmittedPage", figmaNode: "207-11329" },

  // Support
  { path: "/support",             component: "MySupportCasesPage",   figmaNode: "207-10155" },
  { path: "/support/new",         component: "NewSupportCasePage",   figmaNode: "207-11781" },
  { path: "/support/chat",        component: "SupportChatPage",      figmaNode: "207-12302" },

  // Marketing / Info
  { path: "/about",               component: "AboutPage",            figmaNode: "207-11984" },
  { path: "/help",                component: "HelpPage",             figmaNode: "207-12147" },
  { path: "/legal",               component: "LegalPage",            figmaNode: "207-12042" },
  { path: "/for-vendors",         component: "ForVendorsPage",       figmaNode: "207-12388" },
  { path: "/for-organizers",      component: "ForOrganizersPage",    figmaNode: "207-12611" },
  { path: "/for-talents",         component: "ForTalentsPage",       figmaNode: "207-12768" },

  // Error / Utility
  { path: "/maintenance",         component: "MaintenancePage",      figmaNode: "207-12106" },
  { path: "*",                    component: "NotFoundPage",         figmaNode: "207-12542" },
];
```

---

## 4. Design Tokens (CSS Variables)

### Colors

```css
:root {
  /* Surface */
  --surface-canvas: #FFF7F3;
  --surface-card: #FFFFFF;
  --surface-footer: #FFF1E9;
  --surface-chip: #FFF1E9;
  --surface-skeleton: #FFE2D0;
  --surface-skeleton-alt: #FFC0A0;
  --surface-inverse: #191008;
  --surface-tint: #FFF8F4;
  --surface-sold: #F7E9E1;
  --surface-brand-wash: #FFF0E9;
  --surface-featured-from: #FFF2EA;
  --surface-featured-mid: #FFE6D8;
  --surface-featured-to: #F4E9FF;

  /* Ink (text) */
  --ink-primary: #191008;
  --ink-body: #3A2418;
  --ink-muted: #6B5F58;
  --ink-faint: #8E8078;
  --ink-inverse: #FFF7F3;
  --ink-disabled: #C0AEA4;

  /* Border */
  --border-default: #F3DED2;
  --border-strong: #F5C9B4;
  --border-subtle: #F7E9E1;
  --border-brand: #FFC8AE;
  --border-featured: #F7DFD3;

  /* Brand */
  --brand-primary: #F25F2C;
  --brand-deep: #B8320F;
  --brand-strong: #E0451A;
  --brand-light: #FF9147;
  --brand-link: #D8431A;
  --brand-hover: #B8320F;
  --brand-gradient-from: #FF9147;
  --brand-gradient-to: #E0451A;
  --brand-gradient-deep: #C4330B;

  /* Tier */
  --tier-vip: #5A18C4;
  --tier-vip-light: #EEDCFF;
  --tier-gold: #C4330B;
  --tier-gold-light: #FFE2D0;
  --tier-gold-ink: #8A2A08;
  --tier-silver-light: #FFF1E9;
  --tier-bronze: #4E6C8B;
  --tier-bronze-light: #E5F0FC;

  /* Accent */
  --accent-amber: #C4330B;
  --accent-amber-light: #FFC0A0;

  /* Tag */
  --tag-amber-wash: #FFE2D0;
  --tag-brand-ink: #C4330B;
  --tag-rose-wash: #FDECE2;
  --tag-rose-ink: #B8231A;

  /* Badge */
  --badge-rose-wash: #FDECE2;
  --badge-rose-ink: #C4261B;

  /* Bar */
  --bar-brand-wash: #FFF0E9;
  --bar-brand-line: #FFC8AE;

  /* Zone */
  --zone-amber-wash: #FFF4EE;
  --zone-brand-wash: #FFF0E9;

  /* Partners */
  --brand-tabby: #70F6B5;
  --brand-tabby-ink: #0A2A20;
  --brand-tamara: #FFC7C5;
  --brand-tamara-ink: #3A0E14;
  --brand-visa: #1A2B7B;
}
```

### Spacing

```css
:root {
  --space-2xs: 8px;
  --space-xs: 12px;
  --space-sm: 14px;
  --space-md: 18px;
  --space-lg: 20px;
  --space-gutter: 40px;
  --space-section: 88px;
}
```

### Border Radius

```css
:root {
  --radius-sm: 12px;
  --radius-md: 14px;
  --radius-lg: 18px;
  --radius-xl: 20px;
  --radius-2xl: 22px;
  --radius-pill: 999px;
}
```

### Elevation

```css
:root {
  --elevation-card: 0px 1px 2px rgba(25, 16, 8, 0.06), 0px 8px 32px rgba(25, 16, 8, 0.08);
}
```

---

## 5. Typography System

### Font Setup

```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');

:root {
  --font-family: 'Manrope', system-ui, -apple-system, sans-serif;
}
```

### Text Style Classes

```css
/* Display */
.text-display-xl    { font-size: 56px; line-height: 64px; font-weight: 800; letter-spacing: -1.68px; }
.text-display-l     { font-size: 46px; line-height: 48px; font-weight: 800; letter-spacing: -1.61px; }
.text-display-m     { font-size: 42px; line-height: 44px; font-weight: 800; letter-spacing: -1.47px; }
.text-display-s     { font-size: 34px; line-height: 36px; font-weight: 800; letter-spacing: -1.02px; }
.text-display-xs    { font-size: 30px; line-height: 33px; font-weight: 800; letter-spacing: -0.9px; }
.text-display-2xs   { font-size: 26px; line-height: 28px; font-weight: 700; letter-spacing: -0.52px; }
.text-display-card  { font-size: 25px; line-height: 28px; font-weight: 700; letter-spacing: -0.5px; }
.text-display-page  { font-size: 54px; line-height: 55px; font-weight: 800; letter-spacing: -1.89px; }

/* Title */
.text-title-xl      { font-size: 19px; line-height: 23px; font-weight: 600; letter-spacing: 0; }
.text-title-l       { font-size: 17px; line-height: 21px; font-weight: 600; letter-spacing: 0; }
.text-title-m       { font-size: 16px; line-height: 22px; font-weight: 600; letter-spacing: 0; }

/* Body */
.text-body-l        { font-size: 18px; line-height: 28px; font-weight: 500; letter-spacing: 0; }
.text-body-m        { font-size: 16px; line-height: 24px; font-weight: 500; letter-spacing: 0; }
.text-body-s        { font-size: 14px; line-height: 21px; font-weight: 500; letter-spacing: 0; }
.text-body-xs       { font-size: 13px; line-height: 19px; font-weight: 500; letter-spacing: 0; }
.text-body-2xs      { font-size: 12px; line-height: 17px; font-weight: 500; letter-spacing: 0; }

/* Action (buttons, CTAs) */
.text-action-m      { font-size: 15px; line-height: 20px; font-weight: 700; letter-spacing: 0; }
.text-action-s      { font-size: 14px; line-height: 20px; font-weight: 600; letter-spacing: 0; }
.text-action-xs     { font-size: 13px; line-height: 18px; font-weight: 600; letter-spacing: 0; }

/* Link */
.text-link-m        { font-size: 14px; line-height: 20px; font-weight: 700; letter-spacing: 0; }
.text-link-s        { font-size: 13px; line-height: 18px; font-weight: 700; letter-spacing: 0; }

/* Tag */
.text-tag-m         { font-size: 12px; line-height: 16px; font-weight: 700; letter-spacing: 0; }
.text-tag-s         { font-size: 11px; line-height: 14px; font-weight: 700; letter-spacing: 0; }

/* Price */
.text-price-xl      { font-size: 26px; line-height: 30px; font-weight: 800; letter-spacing: 0; }
.text-price-l       { font-size: 20px; line-height: 24px; font-weight: 700; letter-spacing: 0; }
.text-price-m       { font-size: 18px; line-height: 22px; font-weight: 700; letter-spacing: 0; }

/* Specialty */
.text-eyebrow       { font-size: 12px; line-height: 16px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; }
.text-eyebrow-wide  { font-size: 13px; line-height: 16px; font-weight: 800; letter-spacing: 3.64px; text-transform: uppercase; }
.text-meta-date     { font-size: 12px; line-height: 16px; font-weight: 700; letter-spacing: 0.48px; }
.text-nav-m         { font-size: 15px; line-height: 22px; font-weight: 600; letter-spacing: 0; }
```

---

## 6. Component Library → React Components

### Recommended File Structure

```
src/
├── components/
│   ├── ui/                    # Primitives
│   │   ├── Button.tsx         # Style, Size, State props
│   │   ├── TextInput.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── SearchField.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Radio.tsx
│   │   ├── Toggle.tsx
│   │   ├── OTPInput.tsx       # OTPBox + OTPGroup combined
│   │   ├── AmountInput.tsx
│   │   ├── FieldLabel.tsx
│   │   ├── InlineError.tsx
│   │   ├── Spinner.tsx
│   │   ├── Divider.tsx
│   │   ├── Avatar.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Skeleton.tsx
│   │   └── Pagination.tsx
│   │
│   ├── data-display/          # Information display
│   │   ├── StatusBadge.tsx
│   │   ├── FilterChip.tsx
│   │   ├── OverlayBadge.tsx
│   │   ├── CountBadge.tsx
│   │   ├── AttributeTag.tsx
│   │   ├── VersionPill.tsx
│   │   ├── LanguagePill.tsx
│   │   ├── StarRating.tsx
│   │   ├── PriceDisplay.tsx
│   │   ├── Countdown.tsx
│   │   ├── MeterBar.tsx
│   │   ├── MoneySummary.tsx
│   │   ├── RatingSummary.tsx
│   │   ├── StatCard.tsx
│   │   └── KeyValueRow.tsx
│   │
│   ├── cards/                 # Content cards
│   │   ├── TalentCard.tsx
│   │   ├── EventCard.tsx
│   │   ├── ExperienceCard.tsx
│   │   ├── VendorCard.tsx
│   │   ├── OrganizerCard.tsx
│   │   ├── FeaturedHeroCard.tsx
│   │   ├── FeaturedPanelCard.tsx
│   │   ├── AuctionCard.tsx
│   │   ├── CategoryChip.tsx
│   │   └── LoadingCard.tsx
│   │
│   ├── navigation/            # Nav & wayfinding
│   │   ├── SiteHeader.tsx
│   │   ├── SiteFooter.tsx
│   │   ├── NavItem.tsx
│   │   ├── Tabs.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── SearchPill.tsx
│   │   └── Logo.tsx
│   │
│   ├── sections/              # Page-level sections
│   │   ├── SectionHeader.tsx
│   │   ├── EmptyState.tsx
│   │   ├── DeadlineBanner.tsx
│   │   ├── SpecPanel.tsx
│   │   ├── BulletRow.tsx
│   │   ├── FacetList.tsx
│   │   └── ListRow.tsx
│   │
│   └── icons/                 # Icon components
│       └── index.tsx          # Re-exports all icons
│
├── layouts/
│   ├── MainLayout.tsx         # SiteHeader + content + SiteFooter
│   ├── AuthLayout.tsx         # Split 50/50 layout (Sign In, Register)
│   ├── PurchaseLayout.tsx     # Purchase header + content (Checkout, Seat Selection)
│   └── PageSection.tsx        # Reusable section wrapper with standard padding
│
├── pages/                     # One file per route
│   ├── HomePage.tsx
│   ├── EventsPage.tsx
│   ├── ... (see routing map)
│
├── styles/
│   ├── tokens.css             # Design tokens (CSS variables)
│   ├── typography.css         # Text style classes
│   └── globals.css
│
└── lib/
    └── figma-nodes.ts         # Node ID → route mapping for MCP
```

### Key Component Props (TypeScript)

```tsx
// Button
interface ButtonProps {
  style: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'icon';
  size: 'l' | 'm' | 's';
  state?: 'default' | 'hover' | 'disabled' | 'loading';
  label: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  onClick?: () => void;
}

// StatusBadge
interface StatusBadgeProps {
  tone: 'brand-tint' | 'urgent-solid' | 'terminal' | 'neutral-outline' |
        'live-solid' | 'success-tint' | 'inactive' | 'info-tint' | 'danger-tint';
  label: string;
}

// TalentCard
interface TalentCardProps {
  context: 'catalog' | 'home' | 'directory';
  name: string;
  category: string;
  rating: number;
  imageUrl: string;
  price?: { amount: number; currency: string };
}

// EventCard
interface EventCardProps {
  context: 'home' | 'catalog';
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  price?: { amount: number; currency: string };
}

// FilterChip
interface FilterChipProps {
  label: string;
  state: 'default' | 'hover' | 'selected' | 'removable';
  onRemove?: () => void;
}

// Toast
interface ToastProps {
  tone: 'success' | 'error' | 'neutral';
  message: string;
  action?: { label: string; onClick: () => void };
}

// Avatar
interface AvatarProps {
  size: 28 | 52;
  shape: 'circle' | 'squircle';
  src?: string;
  alt: string;
}

// SiteHeader
interface SiteHeaderProps {
  state: 'signed-in' | 'signed-out';
  user?: { name: string; avatarUrl: string };
}

// EmptyState
interface EmptyStateProps {
  variant: 'first-use' | 'filters' | 'gated';
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}
```

---

## 7. Icon System

### Recommended: Use Phosphor Icons React Package

```bash
npm install @phosphor-icons/react
```

The design uses **Phosphor Icons** (51 icons from the library). Map Figma names to package imports:

```tsx
// src/components/icons/index.tsx
export {
  ArrowCounterClockwise, ArrowDown, ArrowUp, ArrowLeft, ArrowRight,
  ArrowUpRight, Bell, BellSimple, BellRinging, Briefcase, Buildings,
  CalendarPlus, CaretDown, Check, CheckCircle, Circle, ClipboardText,
  Clock, ClockCountdown, CreditCard, DeviceMobile, EnvelopeSimple,
  Gavel, GlobeHemisphereEast, Heart, HeartFill, HourglassMedium,
  Laptop, List, LockKey, MagnifyingGlass, MapPin, MusicNotes, Play,
  ShieldCheck, Sparkle, SquaresFour, Star, StarFill, Ticket, User,
  UserCircle, Wallet, Wrench, X, DownloadSimple, Minus, Plus, Power,
  Wheelchair
} from '@phosphor-icons/react';
```

All icons render at **24×24px** by default. Use `size={24}` prop.

### Custom Icons (12)

These are NOT in Phosphor — create custom SVG components:
`Search`, `Bell`, `Heart`, `Calendar`, `ExternalLink`, `Clock`, `Ticket`, `User`, `MapPin`, `Star`, `Home`, `Verified`

---

## 8. Page Layout Architecture

### Layout Pattern A — Standard Page (most pages)

```
┌──────────────────────────────────────────────── 1440px ─┐
│ SiteHeader (instance, 1440×80)                          │
│ ┌─────────────────────────── 1320px ─┐  60px padding    │
│ │ Section 1 (padding-top: ~84-96px)  │  each side       │
│ │ Section 2 (padding-top: ~60-88px)  │                  │
│ │ Section 3 ...                      │                  │
│ └────────────────────────────────────┘                  │
│ SiteFooter (instance, 1440×381)                         │
└─────────────────────────────────────────────────────────┘
```

```tsx
// src/layouts/PageSection.tsx
interface PageSectionProps {
  children: React.ReactNode;
  paddingTop?: number;  // Default: 88 (space/section)
  className?: string;
}

export function PageSection({ children, paddingTop = 88, className }: PageSectionProps) {
  return (
    <section
      className={className}
      style={{ paddingTop, paddingLeft: 60, paddingRight: 60 }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        {children}
      </div>
    </section>
  );
}
```

### Layout Pattern B — Auth Pages (Sign In, Register)

```
┌──────────────────────────────────────────────── 1440px ─┐
│ ┌────── 720px ──────┐ ┌────── 720px ──────┐            │
│ │  Branding / Image  │ │  Form Panel       │            │
│ │                    │ │                    │            │
│ └────────────────────┘ └────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### Layout Pattern C — Purchase Flow (Checkout, Seat Selection)

```
┌──────────────────────────────────────────────── 1440px ─┐
│ Purchase Header (not SiteHeader, 1440×72)                │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Body (HORIZONTAL split — main + sidebar)           │   │
│ └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Home Page Section Map (detailed)

| Section | Padding-top | Content Width | Grid |
|---------|-------------|---------------|------|
| SiteHeader | 0 | 1400px | Horizontal, gap 38 |
| Hero | 60px | 1320px | Horizontal, gap 52 |
| Talents | 84px | 1320px | Row of cards, gap 18 |
| Categories | 72px | 1320px | Chip row, gap 9 |
| Events | 60px | 1320px | 2 rows × 4 cards, gap 20 |
| Featured | 76px | 1320px | Panel + cards |
| Auction | 88px | 1320px | Row of cards, gap 20 |
| Experiences | 88px | 1320px | Row of cards, gap 20 |
| Organizers | 88px | 1320px | Tile grid, gap 16 |
| Vendors | 88px | 1320px | 2 rows × 3 cards, gap 18 |
| CTA | 96px | 1320px | Full-width band |
| BusinessStrip | 72px (top) + 96px (bottom) | 1320px | Link row, gap 16 |
| SiteFooter | 0 | 1400px | 4-col footer + bottom bar |

---

## 9. Key Page Structures

### Event Details Page

```
SiteHeader
Breadcrumb (padding: 12px 60px)
Gallery (padding: 0 60px, image grid)
Main (padding: 0 60px)
  └─ Two-column layout:
     ├─ Left: Event info, description, lineup, tabs
     └─ Right: Sticky booking panel (SpecPanel, PriceDisplay, Button)
Similar (padding: 88px 60px, EventCard grid)
SiteFooter
```

### Talent Detail Page

```
SiteHeader
Hero (absolute positioning — banner image + profile overlay)
Tabs (underline tabs for About, Events, Reviews, etc.)
Body (padding: 0 60px, two-column)
Similar (TalentCard grid)
SiteFooter
```

### Checkout Page

```
Purchase Header (logo + steps + close)
Body (HORIZONTAL)
  ├─ Left panel: Ticket summary, payment form, Tabby/Tamara options
  └─ Right panel: Order summary (MoneySummary component)
```

---

## 10. Figma MCP Context for Cursor

### How to Use with Cursor's Figma MCP

If you have a Figma MCP server configured in Cursor, use these node IDs to fetch design context:

```json
{
  "fileKey": "MvbBN5eknD2xUD5LhUBeBS",
  "pages": {
    "guests": "0:1",
    "designSystem": "86:962",
    "showcase": "73:962"
  }
}
```

#### Fetching a specific screen's design context

To get the full design context for any screen, use the `fileKey` and `node-id` from the table in Section 2. Example for the Home page:

```
fileKey: MvbBN5eknD2xUD5LhUBeBS
nodeId: 207:4362
```

#### Node ID Quick Reference (most-used screens)

```json
{
  "Home":             "207:4362",
  "Events":           "207:4600",
  "Event Details":    "207:4797",
  "Search Results":   "207:5205",
  "Talents":          "207:5539",
  "Talent Detail":    "207:5726",
  "Experiences":      "207:6795",
  "Experience Detail":"207:7048",
  "Vendors":          "207:5992",
  "Vendor Detail":    "207:6338",
  "Organizers":       "207:6112",
  "Organizer Detail": "207:6154",
  "Checkout":         "207:8228",
  "Sign In":          "207:11907",
  "Register":         "207:11849",
  "Profile":          "207:10412",
  "My Tickets":       "207:9469",
  "Saved":            "207:8057",
  "Notifications":    "207:8824",
  "Wallet":           "207:11086",
  "Auction":          "207:10792",
  "Settings":         "207:10247"
}
```

#### Design System Component Node IDs

```json
{
  "Button":           "207:1630",
  "TextInput":        "207:1689",
  "SearchField":      "207:1708",
  "Checkbox":         "207:1717",
  "Radio":            "207:1727",
  "Toggle":           "207:1734",
  "StatusBadge":      "207:1750",
  "FilterChip":       "207:1769",
  "Avatar":           "207:1800",
  "StarRating":       "207:1817",
  "PriceDisplay":     "207:1827",
  "Toast":            "207:2875",
  "EmptyState":       "207:2901",
  "SiteHeader":       "207:2936",
  "SiteFooter":       "207:2977",
  "Modal":            "207:3040",
  "TalentCard":       "207:3100",
  "ExperienceCard":   "207:3166",
  "EventCard":        "207:3254",
  "VendorCard":       "207:3302",
  "OrganizerCard":    "207:3347",
  "Tabs":             "207:2841",
  "Breadcrumbs":      "207:2835",
  "Pagination":       "207:2852",
  "SectionHeader":    "207:2818"
}
```

---

## 11. Implementation Rules & Conventions

### Naming Conventions

| Figma | React | CSS |
|-------|-------|-----|
| `surface/canvas` | — | `--surface-canvas` |
| `ink/primary` | — | `--ink-primary` |
| `space/gutter` | — | `--space-gutter` |
| `radius/pill` | — | `--radius-pill` |
| `Button` (PascalCase) | `<Button />` | `.button` |
| `Style=Primary` | `style="primary"` | `.button--primary` |
| `Size=L` | `size="l"` | `.button--l` |
| `State=Hover` | CSS `:hover` pseudo | `.button:hover` |
| `Display/XL` | — | `.text-display-xl` |

### Key Implementation Rules

1. **Single font:** Only `Manrope` — load weights 500, 600, 700, 800 from Google Fonts
2. **Background:** `--surface-canvas` (#FFF7F3) as the `<body>` background, never pure white
3. **Content width:** Always 1320px max-width with 60px side padding on standard pages
4. **Section spacing:** Use `--space-section` (88px) as default vertical rhythm between sections
5. **Card shadows:** All cards use `--elevation-card` — don't invent new shadows
6. **Pill radius:** Buttons and chips use `--radius-pill` (999px); cards use `--radius-lg` (18px) to `--radius-2xl` (22px)
7. **No dark mode:** Single theme only — no dark mode variables or switching
8. **Brand gradient:** `linear-gradient(to right, var(--brand-gradient-from), var(--brand-gradient-to))` for CTAs and accent bands
9. **Auth pages** use a split 50/50 layout — NOT the standard header/footer layout
10. **Purchase flow** (Checkout, Seat Selection) uses a minimal header — NOT SiteHeader
11. **Grid gaps:** Cards use 18-20px gaps; chip/category rows use 9px gaps
12. **Section headers** follow the `SectionHeader` component pattern — eyebrow + title + optional link

### Tailwind Config (if using Tailwind)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: {
          canvas: '#FFF7F3',
          card: '#FFFFFF',
          footer: '#FFF1E9',
          chip: '#FFF1E9',
          skeleton: '#FFE2D0',
          'skeleton-alt': '#FFC0A0',
          inverse: '#191008',
          tint: '#FFF8F4',
          sold: '#F7E9E1',
          'brand-wash': '#FFF0E9',
        },
        ink: {
          primary: '#191008',
          body: '#3A2418',
          muted: '#6B5F58',
          faint: '#8E8078',
          inverse: '#FFF7F3',
          disabled: '#C0AEA4',
        },
        border: {
          DEFAULT: '#F3DED2',
          strong: '#F5C9B4',
          subtle: '#F7E9E1',
          brand: '#FFC8AE',
        },
        brand: {
          primary: '#F25F2C',
          deep: '#B8320F',
          strong: '#E0451A',
          light: '#FF9147',
          link: '#D8431A',
          hover: '#B8320F',
        },
        tier: {
          vip: '#5A18C4',
          'vip-light': '#EEDCFF',
          gold: '#C4330B',
          'gold-light': '#FFE2D0',
          bronze: '#4E6C8B',
          'bronze-light': '#E5F0FC',
        },
      },
      spacing: {
        '2xs': '8px',
        'xs': '12px',
        'sm': '14px',
        'md': '18px',
        'lg': '20px',
        'gutter': '40px',
        'section': '88px',
      },
      borderRadius: {
        'sm': '12px',
        'md': '14px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '22px',
        'pill': '999px',
      },
      boxShadow: {
        card: '0px 1px 2px rgba(25, 16, 8, 0.06), 0px 8px 32px rgba(25, 16, 8, 0.08)',
      },
      maxWidth: {
        content: '1320px',
        page: '1440px',
      },
    },
  },
};
```

### Recommended Tech Stack

| Concern | Recommended |
|---------|-------------|
| Framework | React 18+ with TypeScript |
| Routing | React Router v6 |
| Styling | Tailwind CSS or CSS Modules with design tokens |
| Icons | `@phosphor-icons/react` + 12 custom SVGs |
| Font | Google Fonts (Manrope 500, 600, 700, 800) |
| State | React Context + TanStack Query for server state |
| Forms | React Hook Form + Zod validation |
| Animation | Framer Motion (for toasts, modals, page transitions) |

---

## Appendix: Figma File Metadata

| Field | Value |
|-------|-------|
| File key | `MvbBN5eknD2xUD5LhUBeBS` |
| Total pages | 5 |
| Designed screens | 51 (Guest web) |
| Components | 93 standalone + 28 component sets |
| Variable tokens | 71 |
| Text styles | 36 |
| Effect styles | 1 |
| Custom icons | 12 |
| Phosphor icons | 51 |
| Primary width | 1440px (content: 1320px) |
| Typeface | Manrope (single family) |
| Brand colour | #F25F2C |
