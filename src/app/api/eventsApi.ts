import { baseApi } from './baseApi'
import { asList, unwrapData } from '@/lib/api/unwrap'

export type ApiRecord = Record<string, unknown>

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEventCategories: build.query<ApiRecord[], void>({
      query: () => '/tickets/categories',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: ['Event'],
    }),
    getEvents: build.query<ApiRecord[], void | { search?: string }>({
      query: (params) => ({
        url: '/tickets/events',
        params: params?.search ? { search: params.search } : undefined,
      }),
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map((event) => ({
                type: 'Event' as const,
                id: String(event.id ?? event.slug ?? ''),
              })),
              { type: 'Event', id: 'LIST' },
            ]
          : [{ type: 'Event', id: 'LIST' }],
    }),
    getEventDetails: build.query<ApiRecord, string | number>({
      query: (eventId) => `/tickets/events/${eventId}`,
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      providesTags: (_r, _e, id) => [{ type: 'Event', id: String(id) }],
    }),
  }),
})

export const {
  useGetEventCategoriesQuery,
  useGetEventsQuery,
  useGetEventDetailsQuery,
} = eventsApi
