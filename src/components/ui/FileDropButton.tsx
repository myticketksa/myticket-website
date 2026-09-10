import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { PlusIcon, UploadIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

export interface FileDropButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: ReactNode
  hint?: ReactNode
  /** `plus` matches support-case attachment; `upload` suits credential / portfolio drops. */
  icon?: 'plus' | 'upload'
}

/** Dashed file-add control used on apply wizards and support forms. */
export function FileDropButton({
  className,
  label,
  hint,
  icon = 'upload',
  ...props
}: FileDropButtonProps) {
  const Glyph = icon === 'plus' ? PlusIcon : UploadIcon
  return (
    <button
      type="button"
      className={cn(
        'flex min-h-[46px] w-full flex-col items-center justify-center gap-[4px] rounded-[12px]',
        'border-[1.5px] border-dashed border-border-dashed bg-bg-page px-[14px] py-[12px]',
        'text-[13.5px] font-semibold text-ink-secondary',
        'transition-colors hover:border-border-focus hover:text-ink-primary',
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-[6px]">
        <Glyph size={14} weight="bold" />
        {label}
      </span>
      {hint && <span className="text-[12px] font-medium text-ink-muted">{hint}</span>}
    </button>
  )
}
