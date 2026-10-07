import { baseApi } from "./baseApi";
import { unwrapData } from "@/lib/api/unwrap";
import { unwrapHoldId } from "@/lib/api/mappers/seats";

export type ApiRecord = Record<string, unknown>;

export const seatsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * Live shape: `{ data: Seat[] }`. Optional `session` matches the app —
     * seats are sold per showtime.
     */
    getEventSeats: build.query<
      unknown,
      string | number | { eventId: string | number; sessionId?: number }
    >({
      query: (arg) => {
        const eventId = typeof arg === "object" ? arg.eventId : arg;
        const sessionId =
          typeof arg === "object" && Number.isInteger(arg.sessionId)
            ? arg.sessionId
            : undefined;
        const qs =
          sessionId != null ? `?session=${encodeURIComponent(String(sessionId))}` : "";
        return `/seats/event/${eventId}${qs}`;
      },
      transformResponse: (response: unknown) => response,
      providesTags: (_r, _e, arg) => {
        const eventId = typeof arg === "object" ? arg.eventId : arg;
        return [{ type: "Event", id: `seats-${eventId}` }];
      },
    }),
    /** Soft-hold before createOrder — same contract as the mobile app. */
    holdSeats: build.mutation<
      ApiRecord,
      {
        eventId: string | number
        seatIds: number[]
        ticketId?: number
        /** Mixed ticket types: one entry per seat. Omit ticketId in that case. */
        seats?: { seatId: number; ticketTypeId: number }[]
      }
    >({
      query: ({ eventId, seatIds, ticketId, seats }) => ({
        url: `/seats/event/${eventId}/hold`,
        method: "POST",
        body: {
          seatIds,
          ...(ticketId != null ? { ticketId } : {}),
          ...(seats?.length ? { seats } : {}),
        },
      }),
      transformResponse: (response: unknown) => {
        const data = unwrapData<ApiRecord>(response) ?? {};
        const holdId = unwrapHoldId(data);
        return holdId ? { ...data, holdId } : data;
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: "Event", id: `seats-${arg.eventId}` },
      ],
    }),
    releaseHold: build.mutation<
      ApiRecord,
      { eventId: string | number; holdId: string }
    >({
      query: ({ eventId, holdId }) => ({
        url: `/seats/event/${eventId}/release`,
        method: "POST",
        body: { holdId },
      }),
      transformResponse: (response: unknown) =>
        unwrapData<ApiRecord>(response) ?? {},
      invalidatesTags: (_r, _e, arg) => [
        { type: "Event", id: `seats-${arg.eventId}` },
      ],
    }),
  }),
});

export const {
  useGetEventSeatsQuery,
  useHoldSeatsMutation,
  useReleaseHoldMutation,
} = seatsApi;
