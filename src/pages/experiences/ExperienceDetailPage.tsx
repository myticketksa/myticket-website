import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSubmitReviewMutation } from '@/app/api/accountApis'
import {
  useFavoriteExperienceMutation,
  useGetExperienceDetailsQuery,
  useGetExperienceReviewsQuery,
  useGetExperiencesQuery,
  useUnfavoriteExperienceMutation,
} from '@/app/api/experiencesApi'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAuthUser, selectIsAuthenticated } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { apiErrorMessage } from '@/lib/api/unwrap'
import { ExperienceCard } from '@/components/cards'
import { StarFillIcon } from '@/components/icons'
import { FadeUp } from '@/components/motion'
import { Breadcrumbs } from '@/components/navigation'
import { Button } from '@/components/ui'
import {
  TalentReviewModal,
  type TalentReviewPayload,
} from '@/components/talents/TalentReviewModal'
import { PageSection } from '@/layouts'
import {
  mapApiExperienceToCard,
  resolveExperienceFromList,
  resolveExperienceId,
  type MappedExperience,
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
} from '@/pages/_guest'

/** Experience detail — Figma `207:7048`. Experiences API with fixture fallback. */
export function ExperienceDetailPage() {
  const { t } = useTranslation(['catalog', 'nav'])
  const { slug } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectAuthUser)
  const slugOrId = slug ?? ''

  const { data: apiExperiences } = useGetExperiencesQuery()
  const [favoriteExperience, favState] = useFavoriteExperienceMutation()
  const [unfavoriteExperience, unfavState] = useUnfavoriteExperienceMutation()
  const [submitReview, reviewState] = useSubmitReviewMutation()
  const [saved, setSaved] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  const catalog = useMemo((): MappedExperience[] => {
    if (apiExperiences && apiExperiences.length > 0) {
      return apiExperiences.map(mapApiExperienceToCard)
    }
    return CATALOG_EXPERIENCES.map((e) => ({
      ...e,
      slug: slugify(e.title),
    })) as MappedExperience[]
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

  const experience = useMemo((): MappedExperience => {
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

  useEffect(() => {
    if (typeof experience.isFavorite === 'boolean') {
      setSaved(experience.isFavorite)
    }
  }, [experience.isFavorite])

  const aboutText =
    experience.about ??
    experience.summary ??
    'A hosted experience on MyTicket — small groups, verified hosts, and clear cancellation. Meet at the published pickup point; transfers and equipment are included unless noted otherwise.'

  const galleryMain =
    experience.banner ?? experience.image ?? experience.photos?.[0] ?? EXPERIENCE_DETAIL_GALLERY.main
  const galleryThumbs = useMemo(() => {
    const photos = experience.photos?.filter(Boolean) ?? []
    if (photos.length === 0) return [...EXPERIENCE_DETAIL_GALLERY.thumbs]
    const rest = photos.filter((src) => src !== galleryMain)
    const pool = rest.length > 0 ? rest : photos
    return [0, 1, 2].map((i) => pool[i] ?? pool[0] ?? galleryMain)
  }, [experience.photos, galleryMain])
  const moreLabel =
    (experience.photos?.length ?? 0) > 4
      ? `+${(experience.photos?.length ?? 0) - 4} photos`
      : '+24 photos'
  const mapsQuery = experience.mapQuery ?? experience.place
  const numericId = resolvedId != null ? Number(resolvedId) : Number.NaN
  const reviewerName = user?.name?.trim() || 'Guest'

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

  function handleRateClick() {
    if (!isAuthenticated) {
      navigate('/sign-in')
      return
    }
    setReviewOpen(true)
  }

  async function handleReviewSubmit(payload: TalentReviewPayload) {
    try {
      await submitReview(payload).unwrap()
      setReviewOpen(false)
      dispatch(toastPushed('success', 'Thanks — your rating was submitted'))
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Could not submit rating')))
    }
  }

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: t('nav:experiences'), href: '/experiences' },
            { label: experience.title },
          ]}
        />
      </PageSection>

      <PageSection padTop={16} padBottom={0}>
        <FadeUp>
          <DetailGallery
            category={experience.meta.split(' · ')[0]}
            moreLabel={moreLabel}
            mainImage={galleryMain}
            thumbs={galleryThumbs}
          />
        </FadeUp>
      </PageSection>

      <PageSection padTop={34} padBottom={0}>
        <article className="min-w-0 max-w-[860px]">
          <FadeUp>
            <p className="text-label-overline text-ink-brand-mid">{experience.meta}</p>
            <h1 className="text-display-hero mt-sm text-ink-primary">{experience.title}</h1>
            <div className="mt-[14px] flex flex-wrap items-center gap-[18px] text-[15px]">
              <span className="flex items-center gap-[5px] font-semibold text-ink-primary">
                <StarFillIcon size={15} />
                {ratingDisplay}
              </span>
              <span className="text-ink-secondary">{experience.place}</span>
            </div>
          </FadeUp>
          <div className="mt-[22px] flex flex-wrap gap-row-gap">
            <Button
              variant="secondary"
              loading={favState.isLoading || unfavState.isLoading}
              onClick={() => void handleSave()}
            >
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="secondary" onClick={handleRateClick}>
              Rate this experience
            </Button>
          </div>

          <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">About</h2>
          <p className="mt-[18px] max-w-[720px] text-[16px] leading-[1.6] text-ink-secondary">
            {aboutText}
          </p>

          <h2 className="text-heading-h2-section mt-[44px] text-ink-primary">Meeting point</h2>
          <div className="mt-[18px] overflow-hidden rounded-[18px] border border-border-default">
            <div className="relative h-[220px] w-full overflow-hidden">
              <img src={EXPERIENCE_DETAIL_MAP} alt="" className="size-full object-cover" />
            </div>
            <div className="flex items-center justify-between gap-lg px-lg py-md">
              <p className="text-[14px] text-ink-secondary">{experience.place}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-[36px] items-center rounded-[18px] border-[1.5px] border-border-default bg-surface-default px-lg text-[13px] font-semibold text-ink-primary hover:border-border-brand hover:text-ink-brand"
              >
                Open in maps
              </a>
            </div>
          </div>
        </article>
      </PageSection>

      <SimilarSection heading={`Similar ${t('nav:experiences').toLowerCase()}`}>
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

      <TalentReviewModal
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        entityType="experience"
        experienceId={Number.isFinite(numericId) ? numericId : undefined}
        userName={reviewerName}
        onSubmit={handleReviewSubmit}
        submitting={reviewState.isLoading}
      />
    </>
  )
}
