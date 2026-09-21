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

export type GetEventsParams = {
  search?: string;
  page?: number;
  categoryId?: string | number;
};

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEventCategories: build.query<ApiRecord[], void>({
      query: () => "/tickets/categories",
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: ["Event"],
    }),
    getEvents: build.query<EventsListResult, void | GetEventsParams>({
      query: (params) => {
        const search = params && "search" in params ? params.search : undefined;
        const page = params && "page" in params ? params.page : undefined;
        const categoryId =
          params && "categoryId" in params ? params.categoryId : undefined;
        return {
          url: "/tickets/events",
          params: {
            ...(search ? { search } : {}),
            ...(page && page > 1 ? { page } : page === 1 ? { page: 1 } : {}),
            ...(categoryId != null ? { "filters[category]": categoryId } : {}),
          },
        };
      },
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
