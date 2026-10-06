import { baseApi } from './baseApi'
import { asList, unwrapData } from '@/lib/api/unwrap'

export type ApiRecord = Record<string, unknown>

export type GetExperiencesParams = {
  categoryId?: string | number
  /** `filters[where]` — city id */
  cityId?: string | number
  /** `filters[type]` — attraction | activity */
  type?: 'attraction' | 'activity'
}

export const experiencesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExperienceCategories: build.query<ApiRecord[], void>({
      query: () => '/experiences/categories',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
    }),
    getExperiences: build.query<ApiRecord[], void | GetExperiencesParams>({
      query: (params) => {
        const categoryId =
          params && 'categoryId' in params ? params.categoryId : undefined
        const cityId = params && 'cityId' in params ? params.cityId : undefined
        const type = params && 'type' in params ? params.type : undefined
        return {
          url: '/experiences',
          params: {
            ...(categoryId != null && categoryId !== ''
              ? { 'filters[category]': categoryId }
              : {}),
            ...(cityId != null && cityId !== ''
              ? { 'filters[where]': cityId }
              : {}),
            ...(type ? { 'filters[type]': type } : {}),
          },
        }
      },
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: [{ type: 'Experience', id: 'LIST' }],
    }),
    getExperienceDetails: build.query<ApiRecord, string | number>({
      query: (id) => `/experiences/${id}`,
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      providesTags: (_r, _e, id) => [{ type: 'Experience', id: String(id) }],
    }),
    getExperienceReviews: build.query<ApiRecord[], string | number>({
      query: (id) => `/experiences/${id}/reviews`,
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
    }),
    createExperience: build.mutation<ApiRecord, FormData>({
      query: (body) => ({
        url: '/experiences',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Experience', id: 'LIST' }, 'Experience'],
    }),
    getMySubmissions: build.query<ApiRecord[], void>({
      query: () => '/experiences/my-submissions',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: ['Experience'],
    }),
    favoriteExperience: build.mutation<unknown, string | number>({
      query: (id) => ({ url: `/experiences/${id}/favorite`, method: 'POST' }),
      invalidatesTags: ['Favorite', 'Experience'],
    }),
    unfavoriteExperience: build.mutation<unknown, string | number>({
      query: (id) => ({ url: `/experiences/${id}/favorite`, method: 'DELETE' }),
      invalidatesTags: ['Favorite', 'Experience'],
    }),
  }),
})

export const {
  useGetExperienceCategoriesQuery,
  useGetExperiencesQuery,
  useGetExperienceDetailsQuery,
  useGetExperienceReviewsQuery,
  useCreateExperienceMutation,
  useGetMySubmissionsQuery,
  useFavoriteExperienceMutation,
  useUnfavoriteExperienceMutation,
} = experiencesApi
