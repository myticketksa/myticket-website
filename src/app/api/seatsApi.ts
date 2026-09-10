import { baseApi } from './baseApi'
import { unwrapData } from '@/lib/api/unwrap'

export type ApiRecord = Record<string, unknown>

export const seatsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEventSeats: build.query<ApiRecord, string | number>({
      query: (eventId) => `/seats/event/${eventId}`,
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      providesTags: (_r, _e, id) => [{ type: 'Event', id: `seats-${id}` }],
    }),
    /**
     * Present in Postman but **not wired in the UI**.
     * SeatSelectionPage keeps a local mock hold until this contract is probed + approved.
     */
    holdSeats: build.mutation<
      ApiRecord,
      { eventId: string | number; seatIds: number[]; ticketId: number }
    >({
      query: ({ eventId, seatIds, ticketId }) => ({
        url: `/seats/event/${eventId}/hold`,
        method: 'POST',
        body: { seatIds, ticketId },
      }),
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
    }),
    releaseHold: build.mutation<ApiRecord, { eventId: string | number; holdId: string }>({
      query: ({ eventId, holdId }) => ({
        url: `/seats/event/${eventId}/release`,
        method: 'POST',
        body: { holdId },
      }),
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
    }),
  }),
})

export const { useGetEventSeatsQuery, useHoldSeatsMutation, useReleaseHoldMutation } = seatsApi
