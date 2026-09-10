import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useFavoriteExperienceMutation,
  useGetExperienceDetailsQuery,
  useGetExperienceReviewsQuery,
  useGetExperiencesQuery,
  useUnfavoriteExperienceMutation,
} from '@/app/api/experiencesApi'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectIsAuthenticated } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { apiErrorMessage } from '@/lib/api/unwrap'
import { ExperienceCard } from '@/components/cards'
import { StarFillIcon } from '@/components/icons'
import { Breadcrumbs } from '@/components/navigation'
import { Button } from '@/components/ui'
import { PageSection } from '@/layouts'
import {
  mapApiExperienceToCard,
  resolveExperienceFromList,
  resolveExperienceId,
} from '@/lib/api/mappers/experiences'
import {
  CATALOG_EXPERIENCES,
  DetailGallery,
  EXPERIENCE_DETAIL_GALLERY,
  EXPERIENCE_DETAIL_MAP,
  EXPERIENCE_DETAIL_NEARBY,
  LinkedCard,
  SimilarSection,
  slugify,
  StickyCtaCard,
} from '@/pages/_guest'

/** Experience detail — Figma `207:7048`. Experiences API with fixture fallback. */
export function ExperienceDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const slugOrId = slug ?? ''

  const { data: apiExperiences } = useGetExperiencesQuery()
  const [favoriteExperience, favState] = useFavoriteExperienceMutation()
  const [unfavoriteExperience, unfavState] = useUnfavoriteExperienceMutation()
  const [saved, setSaved] = useState(false)

  const catalog = useMemo(() => {
    if (apiExperiences && apiExperiences.length > 0) {
      return apiExperiences.map(mapApiExperienceToCard)
    }
    return CATALOG_EXPERIENCES.map((e) => ({ ...e, slug: slugify(e.title) }))
  }, [apiExperiences])

  const resolvedId = useMemo(
    () => resolveExperienceId(apiExperiences, slugOrId),
    [apiExperiences, slugOrId],
  )

  const { data: apiDetail } = useGetExperienceDetailsQuery(resolvedId!, {
    skip: !resolvedId,
  })

  const { data: apiReviews } = useGetExperienceReviewsQuery(resolvedId!, {
    skip: !resolvedId,
  })

  const experience = useMemo(() => {
    const fromList =
      catalog.find((e) => e.slug === slugOrId || slugify(e.title) === slugOrId) ??
      (apiExperiences?.length
        ? mapApiExperienceToCard(resolveExperienceFromList(apiExperiences, slugOrId) ?? {})
        : undefined) ??
      catalog[0]!

    if (apiDetail && Object.keys(apiDetail).length > 0) {
      const mapped = mapApiExperienceToCard(apiDetail)
      return { ...fromList, ...mapped }
    }

    return fromList
  }, [apiDetail, apiExperiences, catalog, slugOrId])

  const ratingDisplay = useMemo(() => {
    if (apiReviews && apiReviews.length > 0 && !experience.rating?.includes('(')) {
      return `${experience.rating} (${apiReviews.length})`
    }
    return experience.rating
  }, [apiReviews, experience.rating])

  const guestLabel = experience.guests ?? 'Up to 12 guests'

  async function handleSave() {
    if (!isAuthenticated) {
      navigate('/sign-in')
      return
    }
    if (!resolvedId) {
      dispatch(toastPushed('error', 'Experience is not available to save yet'))
      return
    }
    try {
      if (saved) {
        await unfavoriteExperience(resolvedId).unwrap()
        setSaved(false)
        dispatch(toastPushed('success', 'Removed from saved'))
      } else {
        await favoriteExperience(resolvedId).unwrap()
        setSaved(true)
        dispatch(toastPushed('success', 'Saved'))
      }
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Could not update saved')))
    }
  }

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Experiences', href: '/experiences' },
            { label: experience.title },
          ]}
        />
      </PageSection>

      <PageSection padTop={16} padBottom={0}>
        <DetailGallery
          category={experience.meta.split(' · ')[0]}
          moreLabel="+24 photos"
          mainImage={experience.image ?? EXPERIENCE_DETAIL_GALLERY.main}
          thumbs={EXPERIENCE_DETAIL_GALLERY.thumbs}
        />
      </PageSection>

      <PageSection padTop={34} padBottom={0}>
        <div className="flex items-start gap-[48px]">
          <article className="min-w-0 flex-1">
            <p className="text-label-overline text-ink-brand-mid">{experience.meta}</p>
            <h1 className="text-display-hero mt-sm text-ink-primary">{experience.title}</h1>
            <div className="mt-[14px] flex flex-wrap items-center gap-[18px] text-[15px]">
              <span className="flex items-center gap-[5px] font-semibold text-ink-primary">
                <StarFillIcon size={15} />
                {ratingDisplay}
              </span>
              <span className="text-ink-secondary">{experience.place}</span>
              <span className="text-ink-secondary">{guestLabel}</span>
            </div>
            <div className="mt-[22px] flex gap-row-gap">
              <Button
                variant="secondary"
                loading={favState.isLoading || unfavState.isLoading}
                onClick={() => void handleSave()}
              >
                {saved ? 'Saved' : 'Save'}
              </Button>
              <Button variant="secondary" disabled title="Share not available yet">
                Share
              </Button>
            </div>

            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">About</h2>
            <p className="mt-[18px] max-w-[720px] text-[16px] leading-[1.6] text-ink-secondary">
              {experience.summary ??
                'A hosted experience on MyTicket — small groups, verified hosts, and clear cancellation. Meet at the published pickup point; transfers and equipment are included unless noted otherwise.'}
            </p>

            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">What’s included</h2>
            <ul className="mt-[18px] max-w-[720px] list-disc space-y-sm pl-xl text-[15px] text-ink-secondary">
              <li>Licensed local host and safety briefing</li>
              <li>Transport from the city meeting point</li>
              <li>Light refreshments during the experience</li>
              <li>Free cancellation up to 48 hours before start</li>
            </ul>

            <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">Meeting point</h2>
            <div className="mt-[18px] overflow-hidden rounded-[18px] border border-border-default">
              <div className="relative h-[220px] w-full overflow-hidden">
                <img
                  src={EXPERIENCE_DETAIL_MAP}
                  alt=""
                  className="size-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-lg px-lg py-md">
                <p className="text-[14px] text-ink-secondary">{experience.place}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(experience.place)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-[36px] items-center rounded-[18px] border-[1.5px] border-border-default bg-surface-default px-lg text-[13px] font-semibold text-ink-primary hover:border-border-brand hover:text-ink-brand"
                >
                  Open in maps
                </a>
              </div>
            </div>
          </article>

          <StickyCtaCard
            fromLabel="From"
            fromPrice={experience.price}
            note="Per guest · select a date to confirm"
            primaryLabel="Check availability"
            secondaryLabel="Ask the host"
            secondaryTo="/support/new"
          />
        </div>
      </PageSection>

      <SimilarSection heading="Similar experiences">
        {catalog
          .filter((e) => e.title !== experience.title)
          .slice(0, 4)
          .map((exp, i) => (
            <LinkedCard
              key={exp.slug ?? exp.title}
              to={`/experiences/${exp.slug ?? slugify(exp.title)}`}
            >
              <ExperienceCard
                title={exp.title}
                location={exp.location}
                tags={exp.tags}
                context="catalog"
                rating={exp.rating}
                guests={exp.guests}
                price={exp.price}
                image={i === 0 ? (exp.image ?? EXPERIENCE_DETAIL_NEARBY) : exp.image}
              />
            </LinkedCard>
          ))}
      </SimilarSection>
    </>
  )
}
