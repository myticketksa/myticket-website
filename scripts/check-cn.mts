/**
 * Guards the `cn()` typography fix. The custom text styles in typography.css are named
 * `text-<role>-<variant>`, which tailwind-merge would otherwise treat as colours and
 * discard. Run with `npx tsx scripts/check-cn.mts`.
 */
import { cn } from '../src/lib/cn'

let failures = 0

function expect(input: string, predicate: (out: string) => boolean, description: string) {
  const out = cn(input)
  const ok = predicate(out)
  if (!ok) failures += 1
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${description}\n        ${JSON.stringify(input)} -> ${JSON.stringify(out)}`)
}

const keepsBoth = (a: string, b: string) => (out: string) => out.includes(a) && out.includes(b)

console.log('a text style and a colour must both survive')
expect('text-heading-card text-ink-primary', keepsBoth('text-heading-card', 'text-ink-primary'), 'heading + colour')
expect('text-label-badge text-ink-brand-strong', keepsBoth('text-label-badge', 'text-ink-brand-strong'), 'badge label + colour')
expect('text-body-small text-ink-secondary', keepsBoth('text-body-small', 'text-ink-secondary'), 'body + colour')
expect('text-label-overline text-ink-brand-mid', keepsBoth('text-label-overline', 'text-ink-brand-mid'), 'overline + colour')
expect('text-numeric-default text-ink-brand', keepsBoth('text-numeric-default', 'text-ink-brand'), 'numeric + colour')
expect('text-display-hero text-ink-primary', keepsBoth('text-display-hero', 'text-ink-primary'), 'display + colour')

console.log('\nreal conflicts must still collapse to the last class')
expect('text-ink-muted text-ink-primary', (o) => o === 'text-ink-primary', 'colour beats colour')
expect('text-[13px] text-[17px]', (o) => o === 'text-[17px]', 'size beats size')
expect('text-heading-card text-[13px]', (o) => o === 'text-[13px]', 'literal size beats a style')
expect('text-body-small text-heading-card', (o) => o === 'text-heading-card', 'style beats style')
expect('text-[13px] text-ink-muted', keepsBoth('text-[13px]', 'text-ink-muted'), 'literal size + colour coexist')

console.log(failures === 0 ? '\nall checks passed' : `\n${failures} check(s) failed`)
process.exit(failures === 0 ? 0 : 1)
