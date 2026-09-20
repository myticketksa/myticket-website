import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSubmitReviewMutation } from '@/app/api/accountApis'
import {
  useFollowTalentMutation,
  useGetTalentDetailsQuery,
  useGetTalentPreviousWorksQuery,
  useGetTalentsQuery,
  useRequestTalentMutation,
  useUnfollowTalentMutation,
} from '@/app/api/talentsApi'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { TalentDirectoryCard } from '@/components/cards'
import {
  HeartGlyphIcon,
  PaperPlaneIcon,
  StarFillIcon,
  StarOutlineIcon,
  UsersIcon,
} from '@/components/icons'
import { FadeUp } from '@/components/motion'
import { Breadcrumbs } from '@/components/navigation'
import {
  TalentRequestModal,
  type TalentRequestPayload,
} from '@/components/talents/TalentRequestModal'
import {
  TalentReviewModal,
  type TalentReviewPayload,
} from '@/components/talents/TalentReviewModal'
import { Button } from '@/components/ui'
import { selectAuthUser } from '@/features/auth/authSlice'
import { toastPushed } from '@/features/ui/uiSlice'
import { PageSection } from '@/layouts'
import { apiErrorMessage } from '@/lib/api/unwrap'
import {
  mapApiTalentToCard,
  resolveTalentFromList,
  resolveTalentId,
  type MappedTalent,
} from '@/lib/api/mappers/talents'
import { useRequireAuth } from '@/lib/auth/useRequireAuth'
import { useTalentFavorites } from '@/lib/favorites/useTalentFavorites'
import {
  CATALOG_TALENTS,
  LinkedCard,
  SimilarSection,
  slugify,
  TALENT_DETAIL_GALLERY,
  TALENT_SIMILAR_IMAGES,
} from '@/pages/_guest'

function workFromApi(work: unknown, index: number) {
  if (typeof work === 'string') {
    return {
      key: `work-${index}`,
      title: `Previous work ${index + 1}`,
      meta: '',
      image: work,
    }
  }
  const row = (work && typeof work === 'object' ? work : {}) as Record<string, unknown>
  return {
    key: String(row.id ?? index),
    title: String(row.title ?? row.name ?? row.event ?? `Previous work ${index + 1}`),
    meta: String(row.venue ?? row.date ?? row.location ?? ''),
    image: String(row.image ?? row.cover ?? row.thumbnail ?? row.url ?? '') || undefined,
  }
}

/**
 * Public talent profile — bio, city, follow/favourite, request, private rate,
 * previous works from API. Reviews are not shown publicly.
 */
export function TalentDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const { requireAuth } = useRequireAuth()
  const { isFavourite, toggleFavourite } = useTalentFavorites()
  const slugOrId = slug ?? ''

  const [requestOpen, setRequestOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  const { data: talentsResult } = useGetTalentsQuery()
  const apiTalents = talentsResult?.items

  const catalog = useMemo(() => {
    if (apiTalents && apiTalents.length > 0) {
      return apiTalents.map(mapApiTalentToCard)
    }
    return CATALOG_TALENTS.map((t) => ({
      ...t,
      slug: slugify(t.name),
      reviews: '',
      city: '',
      id: undefined as string | undefined,
      biography: undefined as string | undefined,
      isFollowing: false,
      ownDiscovery: undefined as boolean | undefined,
    }))
  }, [apiTalents])

  const resolvedId = useMemo(
    () => resolveTalentId(apiTalents, slugOrId) ?? (/^\d+$/.test(slugOrId) ? slugOrId : undefined),
    [apiTalents, slugOrId],
  )

  const { data: apiDetail } = useGetTalentDetailsQuery(resolvedId!, {
    skip: !resolvedId,
  })

  const { data: previousWorks } = useGetTalentPreviousWorksQuery(resolvedId!, {
    skip: !resolvedId,
  })

  const [followTalent, followState] = useFollowTalentMutation()
  const [unfollowTalent, unfollowState] = useUnfollowTalentMutation()
  const [requestTalent, requestState] = useRequestTalentMutation()
  const [submitReview, reviewState] = useSubmitReviewMutation()

  const talent: MappedTalent = useMemo(() => {
    const fromList: MappedTalent =
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

  const works = useMemo(() => {
    if (!previousWorks?.length) return []
    return previousWorks.slice(0, 9).map(workFromApi)
  }, [previousWorks])

  const following = Boolean(talent.isFollowing)
  const favourited = talent.id ? isFavourite(talent.id) : false

  async function handleFollowToggle() {
    if (!talent.id) return
    requireAuth(async () => {
      try {
        if (following) {
          await unfollowTalent(talent.id!).unwrap()
          dispatch(toastPushed('success', 'Unfollowed'))
        } else {
          await followTalent(talent.id!).unwrap()
          dispatch(toastPushed('success', 'Following'))
        }
      } catch (error) {
        dispatch(toastPushed('error', apiErrorMessage(error, 'Could not update follow')))
      }
    })
  }

  function handleFavourite() {
    if (!talent.id) return
    requireAuth(() => {
      void (async () => {
        try {
          await toggleFavourite(talent.id)
        } catch (error) {
          dispatch(toastPushed('error', apiErrorMessage(error, 'Could not update favourite')))
        }
      })()
    })
  }

  function openRequest() {
    requireAuth(() => setRequestOpen(true))
  }

  function openReview() {
    requireAuth(() => setReviewOpen(true))
  }

  async function handleRequestSubmit(payload: TalentRequestPayload) {
    if (!talent.id) return
    try {
      await requestTalent({ ...payload, talent_id: Number(talent.id) }).unwrap()
      setRequestOpen(false)
      dispatch(toastPushed('success', 'Request sent'))
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Could not send request')))
    }
  }

  async function handleReviewSubmit(payload: TalentReviewPayload) {
    try {
      await submitReview(payload).unwrap()
      setReviewOpen(false)
      dispatch(toastPushed('success', 'Rating submitted'))
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, 'Could not submit rating')))
    }
  }

  const biography =
    talent.biography ||
    (apiDetail?.performer && typeof apiDetail.performer === 'object'
      ? String((apiDetail.performer as Record<string, unknown>).biography ?? '')
      : '')

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

      <PageSection padTop={20} padBottom={64}>
        <FadeUp className="mx-auto flex w-full max-w-[720px] flex-col items-center px-0 text-center">
          <div className="size-[120px] overflow-hidden rounded-full border border-border-default bg-bg-skeleton sm:size-[168px]">
            <img
              src={talent.image ?? TALENT_DETAIL_GALLERY.main}
              alt=""
              className="size-full object-cover"
            />
          </div>

          <h1 className="mt-xl min-w-0 max-w-full text-balance text-center text-display-hero text-ink-primary sm:mt-[22px]">
            {talent.name}
          </h1>

          <p className="mt-[10px] text-[15px] text-ink-secondary sm:text-[17px]">{talent.discipline}</p>

          {talent.city ? (
            <p className="mt-[8px] text-[14px] font-medium text-ink-muted">{talent.city}</p>
          ) : null}

          <p className="mt-[14px] inline-flex items-center gap-[5px] text-[15px] font-semibold text-ink-primary">
            <StarFillIcon size={15} />
            {talent.rating}
            {talent.reviews ? (
              <span className="font-medium text-ink-muted">({talent.reviews})</span>
            ) : null}
          </p>

          {biography ? (
            <p className="mt-xl max-w-[560px] text-pretty text-[15px] leading-[1.6] text-ink-secondary sm:mt-[20px]">
              {biography}
            </p>
          ) : null}

          <div className="mt-2xl grid w-full max-w-[440px] grid-cols-2 gap-md sm:mt-[28px] sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-row-gap">
            <Button
              onClick={() => void handleFollowToggle()}
              disabled={followState.isLoading || unfollowState.isLoading}
              className="min-h-[44px] w-full sm:w-auto"
            >
              {following ? 'Unfollow' : 'Follow'}
            </Button>
            <Button
              icon={<PaperPlaneIcon size={18} />}
              onClick={openRequest}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Request
            </Button>
            <Button
              icon={<StarOutlineIcon size={18} weight="fill" />}
              onClick={openReview}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Rate & review
            </Button>
            <Button
              variant="icon"
              size="md"
              aria-label={favourited ? 'Remove from favourites' : 'Add to favourites'}
              onClick={handleFavourite}
              className={favourited ? 'min-h-[44px] text-ink-brand' : 'min-h-[44px]'}
            >
              <HeartGlyphIcon size={18} filled={favourited} />
            </Button>
            <Button
              icon={<UsersIcon size={18} />}
              onClick={() => navigate('/talents')}
              className="col-span-2 min-h-[44px] w-full sm:col-auto sm:w-auto"
            >
              Browse talents
            </Button>
          </div>
        </FadeUp>

        {works.length > 0 && (
          <div className="mx-auto mt-3xl max-w-[960px] sm:mt-[56px]">
            <h2 className="text-heading-h2-section text-center text-balance text-ink-primary">
              Previous work
            </h2>
            <p className="mt-[6px] text-center text-[14px] text-pretty text-ink-secondary sm:text-[15px]">
              Highlights from this talent’s portfolio.
            </p>
            <div className="mt-xl grid grid-cols-1 gap-lg sm:mt-[22px] sm:grid-cols-2 lg:grid-cols-3">
              {works.map((work) => (
                <div
                  key={work.key}
                  className="overflow-hidden rounded-[16px] border border-border-default bg-surface-default"
                >
                  <div className="aspect-[16/10] bg-bg-skeleton sm:aspect-auto sm:h-[140px]">
                    {work.image ? (
                      <img src={work.image} alt="" className="size-full object-cover" />
                    ) : null}
                  </div>
                  <div className="px-[14px] py-[14px]">
                    <p className="text-[15px] font-semibold text-ink-primary">{work.title}</p>
                    {work.meta ? (
                      <p className="mt-[4px] text-[13px] text-ink-secondary">{work.meta}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <SimilarSection
          className="mt-3xl sm:mt-[64px]"
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

      <TalentRequestModal
        open={requestOpen}
        onOpenChange={setRequestOpen}
        submitting={requestState.isLoading}
        onSubmit={handleRequestSubmit}
      />

      {talent.id && user?.name ? (
        <TalentReviewModal
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          talentId={Number(talent.id)}
          userName={user.name}
          submitting={reviewState.isLoading}
          onSubmit={handleReviewSubmit}
        />
      ) : null}
    </>
  )
}
