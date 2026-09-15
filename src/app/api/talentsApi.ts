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
    getTalentPreviousWorks: build.query<(ApiRecord | string)[], string | number>({
      query: (id) => `/talents/${id}/previous-works`,
      transformResponse: (response: unknown) => asList<ApiRecord | string>(response),
    }),
    followTalent: build.mutation<unknown, string | number>({
      query: (id) => ({ url: `/talents/${id}/follow`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Talent', id: String(id) }],
    }),
    unfollowTalent: build.mutation<unknown, string | number>({
      query: (id) => ({ url: `/talents/${id}/unfollow`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Talent', id: String(id) }],
    }),
    favoriteTalent: build.mutation<unknown, string | number>({
      query: (id) => ({ url: `/talents/${id}/favorite`, method: 'POST', body: {} }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Talent', id: String(id) }],
    }),
    unfavoriteTalent: build.mutation<unknown, string | number>({
      query: (id) => ({ url: `/talents/${id}/favorite`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Talent', id: String(id) }],
    }),
    requestTalent: build.mutation<
      unknown,
      {
        talent_id: number
        more_than_month: boolean
        phone_number: string
        requested_date: string
        address: string
        request_reason: string
      }
    >({
      query: ({ talent_id: talentId, ...body }) => ({
        url: '/talents/request',
        method: 'POST',
        body: { ...body, talent_id: talentId },
      }),
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
  useFavoriteTalentMutation,
  useUnfavoriteTalentMutation,
  useRequestTalentMutation,
} = talentsApi
