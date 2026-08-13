import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SectionHeader } from '@/components/sections'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'

export interface SimilarSectionProps {
  heading: string
  lede?: string
  link?: { label: string; to: string }
  /** Defaults to section H2 (34). Event detail similar uses feature H2 (38). */
  headingClassName?: string
  children: ReactNode
  className?: string
}

export function SimilarSection({
  heading,
  lede,
  link,
  headingClassName,
  children,
  className,
}: SimilarSectionProps) {
  return (
    <PageSection padTop={76} padBottom={96} className={className}>
      <SectionHeader
        heading={heading}
        lede={lede}
        headingClassName={headingClassName}
        link={link ? { label: link.label, href: link.to } : undefined}
        className="mb-xl"
      />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {children}
      </div>
    </PageSection>
  )
}

/** Wrap a card so the whole tile links to its detail route. */
export function LinkedCard({
  to,
  className,
  children,
}: {
  to: string
  className?: string
  children: ReactNode
}) {
  return (
    <Link to={to} className={cn('block min-w-0 transition-opacity hover:opacity-95', className)}>
      {children}
    </Link>
  )
}
