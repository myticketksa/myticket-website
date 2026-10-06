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
  if (params.free) query["filters[free]"] = 1;
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
    getEventDetails: build.query<ApiRecord, string | number>({
      query: (eventId) => `/tickets/events/${eventId}`,
      transformResponse: (response: unknown) =>
        unwrapData<ApiRecord>(response) ?? {},
      providesTags: (_r, _e, id) => [{ type: "Event", id: String(id) }],
    }),
  }),
});

export const {
  useGetEventCategoriesQuery,
  useGetEventsQuery,
  useGetEventDetailsQuery,
} = eventsApi;
