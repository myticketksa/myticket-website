import { baseApi } from "./baseApi";
import {
  asList,
  extractPagination,
  type ApiPagination,
  unwrapData,
} from "@/lib/api/unwrap";

export type ApiRecord = Record<string, unknown>;

export type EventsListResult = {
  items: ApiRecord[];
  pagination: ApiPagination;
};

/** Nested `filters[...]` params — same contract as the mobile app / Postman. */
export type GetEventsParams = {
  page?: number;
  categoryId?: string | number;
  cityId?: string | number;
  rating?: string | number;
  free?: boolean;
  upcoming?: boolean;
  from?: string;
  to?: string;
  /** "Tickets and shows": the events an admin put on the home screen. */
  featured?: boolean;
  /** "Recently added": the newest first. */
  newest?: boolean;
};

function eventsFilterParams(params: GetEventsParams | void) {
  if (!params) {
    return { "filters[upcoming]": 1 };
  }
  const query: Record<string, string | number> = {
    "filters[upcoming]": params.upcoming === false ? 0 : 1,
  };
  if (params.page && params.page > 1) query.page = params.page;
  else if (params.page === 1) query.page = 1;
  if (params.categoryId != null && params.categoryId !== "") {
    query["filters[category]"] = params.categoryId;
  }
  if (params.cityId != null && params.cityId !== "") {
    query["filters[city]"] = params.cityId;
  }
  if (params.rating != null && params.rating !== "") {
    query["filters[rating]"] = params.rating;
  }
  // The server only reads "true"; 1 used to be ignored, so the free list showed every event.
  if (params.free) query["filters[free]"] = "true";
  if (params.featured) query["filters[featured]"] = "true";
  if (params.newest) query["filters[newest]"] = "true";
  if (params.from) query["filters[from]"] = params.from;
  if (params.to) query["filters[to]"] = params.to;
  return query;
}

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEventCategories: build.query<ApiRecord[], void>({
      query: () => "/tickets/categories",
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: ["Event"],
    }),
    getEvents: build.query<EventsListResult, void | GetEventsParams>({
      query: (params) => ({
        url: "/tickets/events",
        params: eventsFilterParams(params),
      }),
      transformResponse: (response: unknown): EventsListResult => ({
        items: asList<ApiRecord>(response),
        pagination: extractPagination(response),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((event) => ({
                type: "Event" as const,
                id: String(event.id ?? event.slug ?? ""),
              })),
              { type: "Event", id: "LIST" },
            ]
          : [{ type: "Event", id: "LIST" }],
    }),
    // An activity's next days and times with places left (activities inside
    // one event, 27 Oct 2026).
    getActivitySlots: build.query<ActivitySlot[], { eventId: string | number; activityId: number }>({
      // Four weeks ahead: a Fridays-only course still offers a few dates.
      query: ({ eventId, activityId }) => `/tickets/events/${eventId}/activities/${activityId}/slots?days=30`,
      transformResponse: (response: unknown) => (unwrapData<ActivitySlot[]>(response) ?? []) as ActivitySlot[],
      keepUnusedDataFor: 30,
    }),
    getEventDetails: build.query<ApiRecord, string | number>({
      query: (eventId) => `/tickets/events/${eventId}`,
      transformResponse: (response: unknown) =>
        unwrapData<ApiRecord>(response) ?? {},
      // Asked for by slug or id; tagged with both so either invalidates it.
      providesTags: (result, _e, id) => [
        { type: "Event", id: String(id) },
        ...(result?.id != null ? [{ type: "Event" as const, id: String(result.id) }] : []),
      ],
    }),
  }),
});

export type ActivitySlot = {
  sessionId: number;
  date: string;
  time: string | null;
  startsAt: string | null;
  endsAt: string | null;
  left: number | null;
};

export const {
  useGetActivitySlotsQuery,
  useGetEventCategoriesQuery,
  useGetEventsQuery,
  useGetEventDetailsQuery,
} = eventsApi;
