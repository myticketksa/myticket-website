import { baseApi } from './baseApi'
import { asList, unwrapData } from '@/lib/api/unwrap'

export type ApiRecord = Record<string, unknown>

export const talentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTalentCategories: build.query<ApiRecord[], void>({
      query: () => '/talents/categories',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: ['Talent'],
    }),
    getTalents: build.query<ApiRecord[], void>({
      query: () => '/talents',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: [{ type: 'Talent', id: 'LIST' }],
    }),
    getTalentDetails: build.query<ApiRecord, string | number>({
      query: (id) => `/talents/${id}`,
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      providesTags: (_r, _e, id) => [{ type: 'Talent', id: String(id) }],
    }),
    getTalentPreviousWorks: build.query<ApiRecord[], string | number>({
      query: (id) => `/talents/${id}/previous-works`,
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
    }),
    followTalent: build.mutation<unknown, string | number>({
      query: (id) => ({ url: `/talents/${id}/follow`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Talent', id: String(id) }],
    }),
    unfollowTalent: build.mutation<unknown, string | number>({
      query: (id) => ({ url: `/talents/${id}/unfollow`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Talent', id: String(id) }],
    }),
  }),
})

export const {
  useGetTalentCategoriesQuery,
  useGetTalentsQuery,
  useGetTalentDetailsQuery,
  useGetTalentPreviousWorksQuery,
  useFollowTalentMutation,
  useUnfollowTalentMutation,
} = talentsApi
