import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { PageSection } from '@/layouts'
import { cn } from '@/lib/cn'

type LegalSection = { title: string; body: string }
type LegalDoc = { label: string; toc: string[]; sections: LegalSection[] }

const DOC_IDS = ['terms', 'privacy', 'cookies'] as const

/**
 * Legal — Figma `207:12042`.
 *
 * `?doc=privacy` (etc.) opens straight to that tab.
 */
export function LegalPage() {
  const { t } = useTranslation('marketing')
  const [searchParams] = useSearchParams()
  const requestedDoc = searchParams.get('doc')
  const [active, setActive] = useState(() => {
    const index = DOC_IDS.indexOf(requestedDoc as (typeof DOC_IDS)[number])
    return index === -1 ? 0 : index
  })

  const docs = useMemo(() => {
    const raw = t('legal.docs', { returnObjects: true }) as Record<string, LegalDoc>
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return []
    return DOC_IDS.flatMap((id) => {
      const doc = raw[id]
      if (!doc || typeof doc !== 'object') return []
      return [
        {
          id,
          label: doc.label,
          toc: Array.isArray(doc.toc) ? doc.toc : [],
          sections: Array.isArray(doc.sections) ? doc.sections : [],
        },
      ]
    })
  }, [t])

  const doc = docs[active] ?? docs[0]

  if (!doc) return null

  return (
    <>
      <PageSection padTop={44} padBottom={0}>
        <h1 className="max-w-[900px] text-[32px] leading-[1.02] font-extrabold tracking-[-1.75px] text-ink-primary sm:text-[44px] lg:text-[50px]">
          {t('legal.title')}
        </h1>
        <p className="mt-[8px] max-w-[640px] text-[16px] text-ink-secondary">
          {t('legal.lede')}
        </p>
        <div className="mt-[24px]">
          <div className="flex flex-wrap items-end justify-between gap-md">
            <div className="flex gap-[22px]">
              {docs.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(index)}
                  className={cn(
                    'flex flex-col px-[2px] text-[15px] font-semibold',
                    index === active ? 'text-ink-brand-mid' : 'text-ink-secondary',
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      'mt-[11px] h-[2px] w-full',
                      index === active ? 'bg-ink-brand' : 'bg-transparent',
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="pb-[2px] text-[12.5px] font-semibold text-ink-muted">
              {t('legal.lastUpdated')}
            </p>
          </div>
          <div className="h-px bg-border-default" />
        </div>
      </PageSection>

      <PageSection padTop={28} padBottom={96}>
        <div className="flex flex-col gap-[32px] lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 rounded-[16px] border border-border-default bg-surface-default px-[20px] py-[18px] lg:w-[260px]">
            <p className="text-[12px] font-bold tracking-[0.84px] text-ink-muted uppercase">
              {t('legal.tocLabel')}
            </p>
            <nav className="mt-[12px] flex flex-col gap-[9px]">
              {doc.toc.map((item) => (
                <a
                  key={item}
                  href={`#${item.replace(/\s+/g, '-').toLowerCase()}`}
                  className="text-[13.5px] font-semibold text-ink-secondary hover:text-ink-brand"
                >
                  {item}
                </a>
              ))}
            </nav>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-[14px]">
            {doc.sections.map((section) => (
              <article
                key={section.title}
                id={section.title.replace(/\s+/g, '-').toLowerCase()}
                className="rounded-[18px] border border-border-default bg-surface-default px-[28px] py-[26px]"
              >
                <h2 className="text-[18px] font-bold text-ink-primary">{section.title}</h2>
                <p className="mt-[10px] text-[14.5px] leading-[1.7] text-ink-secondary">
                  {section.body}
                </p>
              </article>
            ))}
            <div className="rounded-[16px] border border-border-default bg-bg-page px-[20px] py-[16px] text-[13.5px] text-ink-secondary">
              {t('legal.questionsPrefix')}{' '}
              <Link to="/support/new" className="font-semibold text-ink-brand">
                {t('legal.talkToSupport')}
              </Link>{' '}
              {t('legal.questionsSuffix')}
            </div>
          </div>
        </div>
      </PageSection>
    </>
  )
}
