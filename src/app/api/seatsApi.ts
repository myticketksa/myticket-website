import { baseApi } from './baseApi'
import { asList, unwrapData } from '@/lib/api/unwrap'
import { unwrapHoldId } from '@/lib/api/mappers/seats'

export type ApiRecord = Record<string, unknown>

export const seatsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Probe shape: `{ data: Seat[] }` (may be empty until inventory is seeded). */
    getEventSeats: build.query<ApiRecord[], string | number>({
      query: (eventId) => `/seats/event/${eventId}`,
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: (_r, _e, id) => [{ type: 'Event', id: `seats-${id}` }],
    }),
    /** Soft-wired from SeatSelection when seat ids are pure numeric + ticketId is known. */
    holdSeats: build.mutation<
      ApiRecord,
      { eventId: string | number; seatIds: number[]; ticketId: number }
    >({
      query: ({ eventId, seatIds, ticketId }) => ({
        url: `/seats/event/${eventId}/hold`,
        method: 'POST',
        body: { seatIds, ticketId },
      }),
      transformResponse: (response: unknown) => {
        const data = unwrapData<ApiRecord>(response) ?? {}
        const holdId = unwrapHoldId(data)
        return holdId ? { ...data, holdId } : data
      },
    }),
    releaseHold: build.mutation<ApiRecord, { eventId: string | number; holdId: string }>({
      query: ({ eventId, holdId }) => ({
        url: `/seats/event/${eventId}/release`,
        method: 'POST',
        body: { holdId },
      }),
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      invalidatesTags: (_r, _e, arg) => [{ type: 'Event', id: `seats-${arg.eventId}` }],
    }),
  }),
})

export const { useGetEventSeatsQuery, useHoldSeatsMutation, useReleaseHoldMutation } = seatsApi
