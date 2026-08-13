export { Logo, type LogoProps } from './Logo'
export { NavItem, type NavItemProps } from './NavItem'
export { SearchPill, type SearchPillProps } from './SearchPill'
export { SiteHeader, type SiteHeaderProps } from './SiteHeader'
export { SiteFooter, type SiteFooterProps } from './SiteFooter'
export { Breadcrumbs, type BreadcrumbsProps, type BreadcrumbItem } from './Breadcrumbs'
export { Pagination, type PaginationProps } from './Pagination'
export {
  NumberedPagination,
  type NumberedPaginationProps,
} from './NumberedPagination'
/**
 * `Tab` is a single tab item, which is what Figma's node is — it names the component
 * "Tab ITEM", not a bar. `TabList` is the required `role="tablist"` parent and carries no
 * paint, deliberately, so it cannot drift into becoming the tab bar Figma leaves unbuilt.
 */
export { Tab, TabList, type TabProps, type TabListProps } from './Tabs'
export {
  DetailSectionTab,
  DetailSectionTabs,
  type DetailSectionTabProps,
  type DetailSectionTabsProps,
} from './DetailSectionTabs'
