import { useState } from 'react'
import { VendorCard } from '@/components/cards'
import { FilterChip } from '@/components/data-display'
import { Checkbox } from '@/components/ui'
import { PageSection } from '@/layouts'
import {
  BusinessStrip,
  CatalogBody,
  CatalogPageHead,
  CITY_FACETS,
  FilterSidebar,
  LinkedCard,
  PromoBand,
  RATING_OPTIONS,
  ResultsToolbar,
  slugify,
  VENDOR_DIRECTORY,
} from '@/pages/_guest'

const SERVICE_CHIPS = [
  'All vendors',
  'Staging',
  'Sound & lighting',
  'Catering',
  'Security',
  'Photo/Video',
  'Logistics',
  'Decor',
  'Staffing',
] as const

/** Vendors directory — Figma `207:5992`. */
export function VendorsPage() {
  const [chip, setChip] = useState('All vendors')

  return (
    <>
      <PageSection padTop={14} padBottom={0}>
        <CatalogPageHead
          eyebrow="Marketplace"
          title="Vendors for every occasion"
          subtitle="Staging, sound, catering, security and more — verified suppliers who work events across the Kingdom."
          chips={SERVICE_CHIPS.map((label) => ({
            label,
            selected: label === chip,
          }))}
          onChipSelect={setChip}
        />
      </PageSection>

      <PageSection padTop={34} padBottom={0}>
        <CatalogBody
          filterWidth={252}
          filters={
            <FilterSidebar title="Narrow it down" clearLabel="Clear" width={252}>
              <div className="flex w-full flex-col gap-[22px]">
                <div>
                  <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                    Works in
                  </p>
                  <div className="mt-md flex flex-col gap-[9px]">
                    {CITY_FACETS.slice(0, 5).map((c, i) => (
                      <Checkbox
                        key={c.label}
                        id={`vendor-city-${i}`}
                        label={c.label}
                        count={c.count}
                        fullWidth
                      />
                    ))}
                  </div>
                </div>
                <div className="h-px bg-border-divider" />
                <div>
                  <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                    Occasion
                  </p>
                  <div className="mt-md flex flex-col gap-[7px]">
                    {['Any occasion', 'Wedding', 'Private majlis', 'Company event'].map(
                      (label, i) => (
                        <FilterChip
                          key={label}
                          selected={i === 0}
                          className="h-[36px] w-full justify-start rounded-[9px] px-md text-[14px]"
                        >
                          {label}
                        </FilterChip>
                      ),
                    )}
                  </div>
                </div>
                <div className="h-px bg-border-divider" />
                <div>
                  <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
                    Rating
                  </p>
                  <div className="mt-md flex flex-wrap gap-[7px]">
                    {RATING_OPTIONS.map((opt, i) => (
                      <FilterChip
                        key={opt}
                        selected={i === 0}
                        className="h-[32px] rounded-[16px] px-md text-[13px] font-semibold"
                      >
                        {opt}
                      </FilterChip>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-border-divider" />
                <Checkbox id="vendor-verified" label="Verified only" fullWidth />
              </div>
            </FilterSidebar>
          }
        >
          <ResultsToolbar
            countLabel="9 of 286 vendors"
            sortValue="Top rated"
            showViewToggle={false}
          />
          <div className="mt-[18px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {VENDOR_DIRECTORY.map((vendor) => (
              <LinkedCard key={vendor.name} to={`/vendors/${slugify(vendor.name)}`}>
                <VendorCard {...vendor} context="directory" />
              </LinkedCard>
            ))}
          </div>
        </CatalogBody>
      </PageSection>

      <PageSection padTop={80} padBottom={0}>
        <PromoBand
          tone="surface"
          heading="Send one enquiry to many vendors"
          body="Describe the occasion once. MyTicket routes it to matching verified suppliers and you compare replies in one thread."
          ctaLabel="Start an enquiry"
          ctaTo="/apply/vendor"
        />
      </PageSection>

      <BusinessStrip
        heading="Offer services on MyTicket?"
        body="Join the vendor marketplace and get enquiries from organizers booking across Saudi Arabia."
        ctaLabel="Become a vendor"
        ctaTo="/apply/vendor"
      />
    </>
  )
}
