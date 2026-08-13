import { useParams } from 'react-router-dom'
import { VendorCard } from '@/components/cards'
import { StarFillIcon, VerifiedIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/navigation'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import {
  CATALOG_VENDORS,
  LinkedCard,
  SimilarSection,
  slugify,
  StickyCtaCard,
  VENDOR_DETAIL_MEDIA,
  VENDOR_DIRECTORY,
} from '@/pages/_guest'

/** Vendor detail — Figma `207:6338`. */
export function VendorDetailPage() {
  const { slug } = useParams()
  const fromDirectory = VENDOR_DIRECTORY.find((v) => slugify(v.name) === slug)
  const fromCatalog = CATALOG_VENDORS.find((v) => slugify(v.name) === slug)
  const vendor = fromCatalog ?? fromDirectory ?? CATALOG_VENDORS[0]
  const isNova = slugify(vendor.name) === slugify('Nova Stage Systems')
  const media = VENDOR_DETAIL_MEDIA

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Vendors', href: '/vendors' },
            { label: vendor.name },
          ]}
        />
      </PageSection>

      <PageSection padTop={16} padBottom={0}>
        <div className="relative h-[280px] overflow-hidden rounded-[18px]">
          <img
            src={isNova ? media.cover : ('image' in vendor ? vendor.image : media.cover)}
            alt=""
            className="size-full object-cover"
          />
        </div>
        <div className="-mt-[40px] flex items-end gap-xl px-xl">
          <div className="size-[96px] overflow-hidden rounded-[24px] border-[4px] border-bg-page bg-bg-skeleton">
            <img
              src={isNova ? media.logo : ('image' in vendor ? vendor.image : media.logo)}
              alt=""
              className="size-full object-cover"
            />
          </div>
          <div className="pb-sm">
            <div className="flex items-center gap-[8px]">
              <h1 className="text-heading-h1 text-ink-primary">{vendor.name}</h1>
              {vendor.verified && <VerifiedIcon size={22} />}
            </div>
            <p className="mt-[4px] text-[15px] text-ink-secondary">{vendor.services}</p>
          </div>
        </div>
      </PageSection>

      <PageSection padTop={34} padBottom={0}>
        <div className="flex items-start gap-[48px]">
          <article className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-[18px] text-[15px]">
              <span className="flex items-center gap-[5px] font-semibold text-ink-primary">
                <StarFillIcon size={15} />
                {vendor.rating} · {vendor.meta}
              </span>
            </div>
            <div className="mt-[22px] flex gap-row-gap">
              <Button>Send enquiry</Button>
              <Button variant="secondary">Save</Button>
              <Button variant="secondary">Share</Button>
            </div>

            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">About</h2>
            <p className="mt-[18px] max-w-[720px] text-[16px] leading-[1.6] text-ink-secondary">
              {vendor.name} supplies {vendor.services.toLowerCase()} for festivals, private
              majlis and corporate events. Coverage: {vendor.meta}. Packages start from{' '}
              {vendor.price}.
            </p>

            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">Services</h2>
            <div className="mt-[18px] grid grid-cols-1 gap-md sm:grid-cols-2">
              {vendor.services.split(' · ').map((service) => (
                <div
                  key={service}
                  className="rounded-[14px] border border-border-default bg-surface-default px-lg py-[14px] text-[15px] font-semibold text-ink-primary"
                >
                  {service}
                </div>
              ))}
            </div>

            {/*
              Figma `207:6338` draws a 2×3 captioned portfolio — not DetailGallery
              (main + 3 thumbs). Keep the drawn grid.
            */}
            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">Recent work</h2>
            <div className="mt-[18px] grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-3">
              {media.portfolio.map((work) => (
                <div
                  key={work.title}
                  className="relative h-[176px] overflow-hidden rounded-[18px]"
                >
                  <img src={work.image} alt="" className="size-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[45%] to-ink-primary/82" />
                  <div className="absolute inset-x-[14px] bottom-[12px] text-ink-inverse">
                    <p className="text-[14px] font-bold">{work.title}</p>
                    <p className="text-[12px] font-medium text-surface-default">{work.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <StickyCtaCard
            fromLabel="Packages from"
            fromPrice={vendor.price}
            note="Typical lead time 10–14 days"
            primaryLabel="Send enquiry"
            secondaryLabel="Request a call"
          />
        </div>
      </PageSection>

      <SimilarSection heading="Similar vendors">
        {(fromDirectory
          ? VENDOR_DIRECTORY.filter((v) => v.name !== vendor.name)
          : CATALOG_VENDORS.filter((v) => v.name !== vendor.name)
        )
          .slice(0, 4)
          .map((v) => (
            <LinkedCard key={v.name} to={`/vendors/${slugify(v.name)}`}>
              <VendorCard {...v} context="directory" />
            </LinkedCard>
          ))}
      </SimilarSection>
    </>
  )
}
