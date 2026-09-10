import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetTalentDetailsQuery, useGetTalentsQuery } from '@/app/api/talentsApi'
import { TalentDirectoryCard } from '@/components/cards'
import { StarFillIcon, VerifiedIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/navigation'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import {
  mapApiTalentToCard,
  resolveTalentFromList,
  resolveTalentId,
} from '@/lib/api/mappers/talents'
import {
  CATALOG_TALENTS,
  LinkedCard,
  SimilarSection,
  slugify,
  TALENT_DETAIL_GALLERY,
  TALENT_SIMILAR_IMAGES,
} from '@/pages/_guest'

/**
 * Limited public talent profile — BIG_CHANGES:
 * avatar/media, name, talent type, rating only. No hire / marketplace / enquire.
 */
export function TalentDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const slugOrId = slug ?? ''

  const { data: apiTalents } = useGetTalentsQuery()

  const catalog = useMemo(() => {
    if (apiTalents && apiTalents.length > 0) {
      return apiTalents.map(mapApiTalentToCard)
    }
    return CATALOG_TALENTS.map((t) => ({ ...t, slug: slugify(t.name), reviews: '', city: '' }))
  }, [apiTalents])

  const resolvedId = useMemo(
    () => resolveTalentId(apiTalents, slugOrId),
    [apiTalents, slugOrId],
  )

  const { data: apiDetail } = useGetTalentDetailsQuery(resolvedId!, {
    skip: !resolvedId,
  })

  const talent = useMemo(() => {
    const fromList =
      catalog.find((t) => t.slug === slugOrId || slugify(t.name) === slugOrId) ??
      (apiTalents?.length
        ? mapApiTalentToCard(resolveTalentFromList(apiTalents, slugOrId) ?? {})
        : undefined) ??
      catalog[0]!

    if (apiDetail && Object.keys(apiDetail).length > 0) {
      const mapped = mapApiTalentToCard(apiDetail)
      return { ...fromList, ...mapped }
    }

    return fromList
  }, [apiDetail, apiTalents, catalog, slugOrId])

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Talents', href: '/talents' },
            { label: talent.name },
          ]}
        />
      </PageSection>

      <PageSection padTop={28} padBottom={96}>
        <div className="mx-auto flex max-w-[720px] flex-col items-center text-center">
          <div className="size-[168px] overflow-hidden rounded-full border border-border-default bg-bg-skeleton">
            <img
              src={talent.image ?? TALENT_DETAIL_GALLERY.main}
              alt=""
              className="size-full object-cover"
            />
          </div>

          <div className="mt-[22px] flex items-center justify-center gap-[8px]">
            <h1 className="text-display-hero text-ink-primary">{talent.name}</h1>
            {talent.verified && <VerifiedIcon size={28} />}
          </div>

          <p className="mt-[10px] text-[17px] text-ink-secondary">{talent.discipline}</p>

          <p className="mt-[14px] inline-flex items-center gap-[5px] text-[15px] font-semibold text-ink-primary">
            <StarFillIcon size={15} />
            {talent.rating}
          </p>

          <div className="mt-[28px] flex flex-wrap justify-center gap-row-gap">
            <Button onClick={() => navigate('/events')}>Find their shows</Button>
            <Button variant="secondary" onClick={() => navigate('/talents')}>
              Browse talents
            </Button>
          </div>
        </div>

        <SimilarSection
          className="mt-[64px]"
          heading="More talents"
          lede="Limited public profiles — name, craft and rating."
        >
          {catalog
            .filter((t) => t.name !== talent.name)
            .slice(0, 4)
            .map((t, i) => (
              <LinkedCard
                key={t.slug ?? t.name}
                to={`/talents/${t.slug ?? slugify(t.name)}`}
              >
                <TalentDirectoryCard
                  name={t.name}
                  discipline={t.discipline}
                  meta=""
                  rating={t.rating}
                  verified={t.verified}
                  image={t.image ?? TALENT_SIMILAR_IMAGES[i] ?? undefined}
                  limited
                />
              </LinkedCard>
            ))}
        </SimilarSection>
      </PageSection>
    </>
  )
}
