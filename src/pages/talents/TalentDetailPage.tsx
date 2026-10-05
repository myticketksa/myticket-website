import { Dialog as DialogPrimitive } from 'radix-ui'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useSubmitReviewMutation } from '@/app/api/accountApis'
import {
  useFollowTalentMutation,
  useGetTalentDetailsQuery,
  useGetTalentsQuery,
  useRequestTalentMutation,
  useUnfollowTalentMutation,
} from '@/app/api/talentsApi'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { TalentDirectoryCard } from '@/components/cards'
import {
  CloseIcon,
  HeartGlyphIcon,
  PaperPlaneIcon,
  PlayIcon,
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
  LinkedCard,
  SimilarSection,
  slugify,
  TALENT_DETAIL_GALLERY,
  TALENT_SIMILAR_IMAGES,
} from '@/pages/_guest'

const VIDEO_URL = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i

function isVideoUrl(value: string): boolean {
  return VIDEO_URL.test(value.trim())
}

function pushVideoUrl(urls: string[], value: unknown) {
  if (typeof value !== 'string') return
  const url = value.trim()
  if (!url || !isVideoUrl(url) || urls.includes(url)) return
  urls.push(url)
}

/** Portfolio clips from talent detail — video files only. */
function portfolioVideos(detail: Record<string, unknown> | undefined): string[] {
  if (!detail) return []
  const portfolio = detail.portfolio
  if (!portfolio || typeof portfolio !== 'object') return []
  const record = portfolio as Record<string, unknown>
  const urls: string[] = []
  pushVideoUrl(urls, record.bestVideo ?? record.best_video)
  const media = record.media
  if (Array.isArray(media)) {
    for (const item of media) {
      if (typeof item === 'string') {
        pushVideoUrl(urls, item)
        continue
      }
      if (item && typeof item === 'object') {
        const row = item as Record<string, unknown>
        pushVideoUrl(urls, row.url ?? row.src ?? row.path ?? row.video)
      }
    }
  }
  return urls
}

function PortfolioVideoDialog({
  src,
  title,
  closeLabel,
  onOpenChange,
}: {
  src: string | null
  title: string
  closeLabel: string
  onOpenChange: (open: boolean) => void
}) {
  const open = src != null

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-surface-inverse/55 backdrop-blur-[1.5px]" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[min(920px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] bg-bg-page shadow-overlay outline-none">
          <div className="flex items-center justify-between gap-md px-lg py-md">
            <DialogPrimitive.Title className="text-[16px] font-bold text-ink-primary">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label={closeLabel}
              className="flex size-[36px] items-center justify-center rounded-full text-ink-muted hover:bg-bg-skeleton hover:text-ink-primary"
            >
              <CloseIcon size={18} />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
          {src ? (
            <video
              key={src}
              src={src}
              controls
              autoPlay
              playsInline
              className="aspect-video w-full bg-ink-primary"
            />
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/**
 * Public talent profile — bio, city, follow/favourite, request, private rate,
 * previous works from API. Reviews are not shown publicly.
 */
export function TalentDetailPage() {
  const { t } = useTranslation('catalog')
  const { slug } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const { requireAuth } = useRequireAuth()
  const { isFavourite, toggleFavourite } = useTalentFavorites()
  const slugOrId = slug ?? ''

  const [requestOpen, setRequestOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  const { data: talentsResult } = useGetTalentsQuery()
  const apiTalents = talentsResult?.items

  const catalog = useMemo(() => {
    if (apiTalents && apiTalents.length > 0) {
      return apiTalents.map(mapApiTalentToCard)
    }
    // No sample catalogue behind the API — an empty list stays empty.
    return [];
  }, [apiTalents])

  const resolvedId = useMemo(
    () => resolveTalentId(apiTalents, slugOrId) ?? (/^\d+$/.test(slugOrId) ? slugOrId : undefined),
    [apiTalents, slugOrId],
  )

  const { data: apiDetail } = useGetTalentDetailsQuery(resolvedId!, {
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

  const videos = useMemo(() => portfolioVideos(apiDetail), [apiDetail])

  const following = Boolean(talent.isFollowing)
  const favourited = talent.id ? isFavourite(talent.id) : false

  async function handleFollowToggle() {
    if (!talent.id) return
    requireAuth(async () => {
      try {
        if (following) {
          await unfollowTalent(talent.id!).unwrap()
          dispatch(toastPushed('success', t('talent.toastUnfollowed')))
        } else {
          await followTalent(talent.id!).unwrap()
          dispatch(toastPushed('success', t('talent.toastFollowing')))
        }
      } catch (error) {
        dispatch(toastPushed('error', apiErrorMessage(error, t('talent.toastFollowError'))))
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
          dispatch(
            toastPushed('error', apiErrorMessage(error, t('talent.toastFavouriteError'))),
          )
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
      dispatch(toastPushed('success', t('talent.toastRequestSent')))
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('talent.toastRequestError'))))
    }
  }

  async function handleReviewSubmit(payload: TalentReviewPayload) {
    try {
      await submitReview(payload).unwrap()
      setReviewOpen(false)
      dispatch(toastPushed('success', t('talent.toastRatingSubmitted')))
    } catch (error) {
      dispatch(toastPushed('error', apiErrorMessage(error, t('talent.toastRatingError'))))
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
            { label: t('talent.crumbHome'), href: '/' },
            { label: t('talent.crumbTalents'), href: '/talents' },
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
              {following ? t('talent.unfollow') : t('talent.follow')}
            </Button>
            <Button
              icon={<PaperPlaneIcon size={18} />}
              onClick={openRequest}
              className="min-h-[44px] w-full sm:w-auto"
            >
              {t('talent.request')}
            </Button>
            <Button
              icon={<StarOutlineIcon size={18} weight="fill" />}
              onClick={openReview}
              className="min-h-[44px] w-full sm:w-auto"
            >
              {t('talent.rateReview')}
            </Button>
            <Button
              variant="icon"
              size="md"
              aria-label={
                favourited ? t('talent.removeFavourite') : t('talent.addFavourite')
              }
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
              {t('talent.browseTalents')}
            </Button>
          </div>
        </FadeUp>

        {videos.length > 0 && (
          <div className="mx-auto mt-3xl max-w-[960px] sm:mt-[56px]">
            <h2 className="text-heading-h2-section text-center text-balance text-ink-primary">
              {t('talent.previousWork')}
            </h2>
            <p className="mt-[6px] text-center text-[14px] text-pretty text-ink-secondary sm:text-[15px]">
              {t('talent.previousWorkLede')}
            </p>
            <div className="mt-xl grid grid-cols-1 gap-lg sm:mt-[22px] sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveVideo(src)}
                  aria-label={t('talent.playVideo')}
                  className="group relative overflow-hidden rounded-[16px] border border-border-default bg-bg-skeleton text-start"
                >
                  <video
                    src={`${src}#t=0.1`}
                    muted
                    playsInline
                    preload="metadata"
                    tabIndex={-1}
                    aria-hidden
                    className="pointer-events-none aspect-[16/10] w-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-ink-primary/25 transition-colors group-hover:bg-ink-primary/35">
                    <span className="flex size-[52px] items-center justify-center rounded-full bg-bg-page text-ink-brand shadow-lift">
                      <PlayIcon size={22} weight="fill" />
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <PortfolioVideoDialog
          src={activeVideo}
          title={t('talent.previousWork')}
          closeLabel={t('talent.closeVideo')}
          onOpenChange={(open) => {
            if (!open) setActiveVideo(null)
          }}
        />

        <SimilarSection
          className="mt-3xl sm:mt-[64px]"
          heading={t('talent.moreTalents')}
          lede={t('talent.moreTalentsLede')}
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
