import { asList, unwrapData } from '@/lib/api/unwrap'

export type ApiRecord = Record<string, unknown>

/** Normalize wallet envelope — probe returns `data: Transaction[]` + sibling pagination. */
export function normalizeWalletResponse(response: unknown): {
  transactions: ApiRecord[]
  pagination?: ApiRecord
} {
  const transactions = asList<ApiRecord>(response)
  let pagination: ApiRecord | undefined
  if (response && typeof response === 'object' && 'pagination' in response) {
    const value = (response as { pagination?: unknown }).pagination
    if (value && typeof value === 'object') pagination = value as ApiRecord
  } else {
    const data = unwrapData<unknown>(response)
    if (data && typeof data === 'object' && !Array.isArray(data) && 'pagination' in data) {
      const value = (data as { pagination?: unknown }).pagination
      if (value && typeof value === 'object') pagination = value as ApiRecord
    }
  }
  return { transactions, pagination }
}
