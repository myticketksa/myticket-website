import { localizedString } from '@/lib/api/locale'
import type { IdLabelOption } from '@/lib/api/formPayload'

type ApiRecord = Record<string, unknown>

/**
 * Fallback when `GET /generals/cities` is unreachable — ids match production
 * `cities` rows so `filters[city]` / `filters[in]` still work for guests.
 */
export const SAUDI_CITY_FALLBACK: IdLabelOption[] = [
  { value: '13', label: 'Abha' },
  { value: '21', label: 'Al Ahsa' },
  { value: '23', label: 'Al Khafji' },
  { value: '3', label: 'AlUla' },
  { value: '19', label: 'Buraidah' },
  { value: '4', label: 'Dammam' },
  { value: '10', label: 'Dhahran' },
  { value: '5', label: 'Diriyah' },
  { value: '17', label: 'Hail' },
  { value: '18', label: 'Jazan' },
  { value: '2', label: 'Jeddah' },
  { value: '14', label: 'Jubail' },
  { value: '9', label: 'Khobar' },
  { value: '20', label: 'Khamis Mushait' },
  { value: '7', label: 'Mecca' },
  { value: '8', label: 'Medina' },
  { value: '16', label: 'Najran' },
  { value: '22', label: 'Qatif' },
  { value: '1', label: 'Riyadh' },
  { value: '12', label: 'Tabuk' },
  { value: '11', label: 'Taif' },
  { value: '15', label: 'Yanbu' },
]

/** City rows from `GET /generals/cities` → dropdown / filter options. */
export function mapCityOptions(
  records: ApiRecord[] | undefined,
  fallback: IdLabelOption[] = SAUDI_CITY_FALLBACK,
): IdLabelOption[] {
  const fromApi = (records ?? [])
    .map((row) => {
      const value = String(row.id ?? row.city_id ?? row.value ?? '')
      if (!value) return null
      const label =
        localizedString(row.name) ||
        localizedString(row.title) ||
        localizedString(row.label) ||
        value
      return { value, label }
    })
    .filter((row): row is IdLabelOption => row != null)

  return fromApi.length > 0 ? fromApi : fallback
}

/** Category rows with stable ids for API `filters[category]`. */
export function mapCategoryOptions(
  records: ApiRecord[] | undefined,
  opts?: { allLabel?: string; fallback?: IdLabelOption[] },
): IdLabelOption[] {
  const fromApi = (records ?? [])
    .map((row) => {
      const value = String(row.id ?? row.value ?? '')
      if (!value) return null
      const label =
        localizedString(row.name) ||
        localizedString(row.title) ||
        localizedString(row.label) ||
        localizedString(row.name_en) ||
        value
      return { value, label }
    })
    .filter((row): row is IdLabelOption => row != null)

  const list = fromApi.length > 0 ? fromApi : [...(opts?.fallback ?? [])]
  if (opts?.allLabel) {
    return [{ value: '', label: opts.allLabel }, ...list]
  }
  return list
}
