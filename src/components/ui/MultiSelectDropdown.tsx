import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FieldLabel } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { IdLabelOption } from '@/lib/api/formPayload'

export interface MultiSelectDropdownProps {
  label?: string
  options: readonly IdLabelOption[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  className?: string
  /** Allow selecting more than one option (talent apply). Default true. */
  multi?: boolean
  /**
   * When set, show an “All” row that clears the selection (browse filters).
   * Value is never included in `onChange` — empty array means all.
   */
  allLabel?: string
  /** Compact trigger for catalog filter bars. */
  size?: 'field' | 'chip'
}

/**
 * Closed field that opens a checklist — same pattern as the app FilterModal
 * (list row → apply), not an inline chip strip.
 */
export function MultiSelectDropdown({
  label,
  options,
  value,
  onChange,
  placeholder,
  className,
  multi = true,
  allLabel,
  size = 'field',
}: MultiSelectDropdownProps) {
  const { t } = useTranslation('common')
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string[]>(value)

  useEffect(() => {
    if (open) setDraft(value)
  }, [open, value])

  useEffect(() => {
    if (!open) return
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const selectedLabels = options
    .filter((option) => value.includes(option.value) && option.value !== '')
    .map((option) => option.label)

  const summary =
    selectedLabels.length === 0
      ? (allLabel ??
        placeholder ??
        label ??
        t('actions.select', { defaultValue: 'Select' }))
      : selectedLabels.join(', ')

  const isAll = draft.length === 0

  function toggle(optionValue: string | null) {
    if (optionValue == null || optionValue === '') {
      setDraft([])
      return
    }
    if (!multi) {
      setDraft([optionValue])
      return
    }
    setDraft((prev) =>
      prev.includes(optionValue)
        ? prev.filter((item) => item !== optionValue)
        : [...prev, optionValue],
    )
  }

  const triggerClass =
    size === 'chip'
      ? cn(
          'inline-flex min-h-[38px] max-w-full items-center justify-between gap-sm rounded-full border px-md text-[14px] font-medium',
          value.length > 0
            ? 'border-brand-primary bg-brand-primary/8 text-ink-brand'
            : 'border-border-default bg-surface-default text-ink-primary',
          'hover:border-border-brand',
        )
      : cn(
          'flex min-h-[48px] w-full items-center justify-between gap-md rounded-[12px] border border-border-default bg-bg-page px-md text-start text-[14px] font-semibold text-ink-primary',
          'hover:border-border-brand',
        )

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative flex flex-col',
        size === 'chip' && 'inline-flex',
        className,
      )}
    >
      {label && size === 'field' ? (
        <FieldLabel className="mb-[7px]">{label}</FieldLabel>
      ) : null}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label}
        onClick={() => setOpen((prev) => !prev)}
        className={triggerClass}
      >
        <span
          className={cn(
            'min-w-0 truncate',
            selectedLabels.length === 0 && size === 'field' && 'text-ink-muted',
          )}
        >
          {summary}
        </span>
        <span aria-hidden className="shrink-0 text-ink-muted">
          ▾
        </span>
      </button>

      {open ? (
        <div
          id={panelId}
          className={cn(
            'absolute z-30 flex max-h-[280px] flex-col overflow-hidden rounded-[14px] border border-border-default bg-surface-default shadow-overlay',
            size === 'chip'
              ? 'start-0 top-[calc(100%+6px)] w-[min(280px,calc(100vw-48px))]'
              : 'inset-x-0 top-[calc(100%+6px)]',
          )}
        >
          <ul className="flex-1 overflow-y-auto p-sm">
            {allLabel ? (
              <li>
                <button
                  type="button"
                  onClick={() => toggle(null)}
                  className={cn(
                    'flex w-full items-center justify-between gap-md rounded-[10px] px-md py-sm text-start text-[14px]',
                    isAll ? 'bg-bg-warm' : 'hover:bg-bg-page',
                  )}
                >
                  <span className="min-w-0 flex-1 font-medium text-ink-primary">
                    {allLabel}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded-[4px] border text-[10px] font-bold text-ink-inverse',
                      isAll
                        ? 'border-brand-primary bg-brand-primary'
                        : 'border-border-default bg-surface-default',
                    )}
                  >
                    {isAll ? '✓' : null}
                  </span>
                </button>
              </li>
            ) : null}
            {options
              .filter((option) => option.value !== '')
              .map((option) => {
                const checked = draft.includes(option.value)
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => toggle(option.value)}
                      className={cn(
                        'flex w-full items-center justify-between gap-md rounded-[10px] px-md py-sm text-start text-[14px]',
                        checked ? 'bg-bg-warm' : 'hover:bg-bg-page',
                      )}
                    >
                      <span className="min-w-0 flex-1 font-medium text-ink-primary">
                        {option.label}
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          'flex size-4 shrink-0 items-center justify-center rounded-[4px] border text-[10px] font-bold text-ink-inverse',
                          checked
                            ? 'border-brand-primary bg-brand-primary'
                            : 'border-border-default bg-surface-default',
                        )}
                      >
                        {checked ? '✓' : null}
                      </span>
                    </button>
                  </li>
                )
              })}
          </ul>
          <div className="border-t border-border-divider p-sm">
            <Button
              type="button"
              className="w-full"
              size="md"
              onClick={() => {
                onChange(draft)
                setOpen(false)
              }}
            >
              {t('actions.continue', { defaultValue: 'Apply' })}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
