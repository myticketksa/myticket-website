import { useRef, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { PlusIcon, UploadIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

export interface FileDropButtonProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: ReactNode
  hint?: ReactNode
  /** `plus` matches support-case attachment; `upload` suits credential / portfolio drops. */
  icon?: 'plus' | 'upload'
  /** Selected files from the native picker. */
  onFiles?: (files: File[]) => void
  /** Shown under the hint when at least one file is chosen. */
  fileName?: string
}

/** Dashed file-add control used on apply wizards and support forms. */
export function FileDropButton({
  className,
  label,
  hint,
  icon = 'upload',
  onFiles,
  fileName,
  accept,
  multiple,
  disabled,
  ...inputProps
}: FileDropButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const Glyph = icon === 'plus' ? PlusIcon : UploadIcon

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    onFiles?.(files)
  }

  return (
    <div className={cn('w-full', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex min-h-[46px] w-full flex-col items-center justify-center gap-[4px] rounded-[12px]',
          'border-[1.5px] border-dashed border-border-dashed bg-bg-page px-[14px] py-[12px]',
          'text-[13.5px] font-semibold text-ink-secondary',
          'transition-colors hover:border-border-focus hover:text-ink-primary',
          disabled && 'cursor-not-allowed opacity-55',
        )}
      >
        <span className="inline-flex items-center gap-[6px]">
          <Glyph size={14} weight="bold" />
          {label}
        </span>
        {hint && <span className="text-[12px] font-medium text-ink-muted">{hint}</span>}
        {fileName && (
          <span className="max-w-full truncate text-[12px] font-semibold text-ink-brand">
            {fileName}
          </span>
        )}
      </button>
      <input
        {...inputProps}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={handleChange}
      />
    </div>
  )
}
