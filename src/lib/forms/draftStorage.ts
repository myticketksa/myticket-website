export type FormDraftKey = 'talent' | 'vendor'

const STORAGE_PREFIX = 'myticket.draft.' as const

export type StoredFormDraft<T> = {
  step: number
  draft: T
  savedAt: string
}

function storageKey(key: FormDraftKey): string {
  return `${STORAGE_PREFIX}${key}`
}

/** Strip File / File[] values — uploads must be re-picked after restore. */
export function stripFilesForStorage<T extends Record<string, unknown>>(draft: T): T {
  const next = { ...draft }
  for (const key of Object.keys(next)) {
    const value = next[key]
    if (typeof File !== 'undefined' && value instanceof File) {
      delete next[key]
      continue
    }
    if (Array.isArray(value) && value.some((item) => item instanceof File)) {
      ;(next as Record<string, unknown>)[key] = []
    }
  }
  return next
}

export function saveDraft<T extends Record<string, unknown>>(
  key: FormDraftKey,
  step: number,
  draft: T,
): void {
  try {
    const payload: StoredFormDraft<T> = {
      step,
      draft: stripFilesForStorage(draft),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(storageKey(key), JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}

export function loadDraft<T extends Record<string, unknown>>(
  key: FormDraftKey,
): StoredFormDraft<T> | null {
  try {
    const raw = localStorage.getItem(storageKey(key))
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredFormDraft<T>
    if (!parsed || typeof parsed !== 'object' || parsed.draft == null) return null
    return {
      step: Number.isFinite(parsed.step) ? Math.max(0, Math.floor(parsed.step)) : 0,
      draft: parsed.draft,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function clearDraft(key: FormDraftKey): void {
  try {
    localStorage.removeItem(storageKey(key))
  } catch {
    /* ignore */
  }
}
