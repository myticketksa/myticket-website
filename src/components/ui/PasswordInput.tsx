import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EyeIcon, EyeOffIcon } from '@/components/icons'
import { TextInput, type TextInputProps } from './TextInput'

/**
 * A password field with an eye button that shows or hides what was typed,
 * so people can check a password before sending it.
 */
export function PasswordInput(props: Omit<TextInputProps, 'type' | 'trailing'>) {
  const { t } = useTranslation('common')
  const [visible, setVisible] = useState(false)
  const label = visible ? t('a11y.hidePassword') : t('a11y.showPassword')

  return (
    <TextInput
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={label}
          aria-pressed={visible}
          title={label}
          className="flex size-[32px] shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink-primary"
        >
          {visible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      }
    />
  )
}
