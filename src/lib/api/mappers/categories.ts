type ApiRecord = Record<string, unknown>

/** Normalize category / taxonomy rows from guest list endpoints. */
export function mapCategoryLabel(record: ApiRecord, fallback = ''): string {
  const label = record.name ?? record.title ?? record.label ?? record.category ?? record.name_en
  if (label != null && String(label).trim()) return String(label).trim()
  return fallback
}

export function mapCategoryLabels(
  records: ApiRecord[] | undefined,
  opts?: { allLabel?: string; fallback?: readonly string[] },
): string[] {
  const allLabel = opts?.allLabel
  const fromApi = (records ?? [])
    .map((row) => mapCategoryLabel(row))
    .filter(Boolean)

  const unique = [...new Set(fromApi)]
  if (unique.length === 0) {
    return opts?.fallback ? [...opts.fallback] : allLabel ? [allLabel] : []
  }

  if (allLabel && !unique.includes(allLabel)) {
    return [allLabel, ...unique]
  }
  return unique
}
