import { useLiveRemaining } from './useLiveRemaining'

/** Clock text that ticks from a fixture remaining-time string. Safe to use inside lists. */
export function LiveRemaining({
  initial,
  prefix,
}: {
  initial: string
  prefix?: string
}) {
  const remaining = useLiveRemaining(initial)
  return (
    <>
      {prefix}
      {remaining}
    </>
  )
}
