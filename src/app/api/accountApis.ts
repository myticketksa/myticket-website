import { baseApi } from './baseApi'
import { asList, unwrapData } from '@/lib/api/unwrap'

export type ApiRecord = Record<string, unknown>

export const accountApis = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFavorites: build.query<ApiRecord[], void>({
      query: () => '/favorites',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: ['Favorite'],
    }),
    addFavorite: build.mutation<unknown, string | number>({
      query: (eventId) => ({ url: `/favorites/${eventId}`, method: 'POST' }),
      invalidatesTags: ['Favorite'],
    }),
    deleteFavorite: build.mutation<unknown, string | number>({
      query: (eventId) => ({ url: `/favorites/${eventId}`, method: 'DELETE' }),
      invalidatesTags: ['Favorite'],
    }),
    getWallet: build.query<ApiRecord, void>({
      query: () => '/wallet',
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      providesTags: ['Wallet'],
    }),
    topUpWallet: build.mutation<ApiRecord, { amount: number; paymentMethod: string }>({
      query: (body) => ({ url: '/wallet/topup', method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      invalidatesTags: ['Wallet'],
    }),
    getNotificationCategories: build.query<ApiRecord[], void>({
      query: () => '/notifications/categories',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
    }),
    getNotifications: build.query<ApiRecord[], void>({
      query: () => '/notifications',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: ['Notification'],
    }),
    markNotificationRead: build.mutation<unknown, string | number>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'POST' }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: build.mutation<unknown, void>({
      query: () => ({ url: '/notifications/read/all', method: 'POST' }),
      invalidatesTags: ['Notification'],
    }),
    getMyApplication: build.query<ApiRecord, void>({
      query: () => '/applications',
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      providesTags: ['Application'],
    }),
    applyTalent: build.mutation<ApiRecord, FormData>({
      query: (body) => ({ url: '/applications/talent', method: 'POST', body }),
      invalidatesTags: ['Application'],
    }),
    applyVendor: build.mutation<ApiRecord, FormData>({
      query: (body) => ({ url: '/applications/vendor', method: 'POST', body }),
      invalidatesTags: ['Application'],
    }),
    getCities: build.query<ApiRecord[], void>({
      query: () => '/generals/cities',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
    }),
    getOfferedServices: build.query<ApiRecord[], void>({
      query: () => '/generals/offered-services',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
    }),
    getPerformanceCategories: build.query<ApiRecord[], void>({
      query: () => '/generals/performance-categories',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
    }),
    getMyReviews: build.query<ApiRecord[], void>({
      query: () => '/reviews',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: ['Review'],
    }),
    submitReview: build.mutation<
      unknown,
      {
        type: 'event' | 'experience' | 'talent' | 'vendor'
        id: number
        rating: number
        name: string
        review?: string
        comment?: string
      }
    >({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: ['Review'],
    }),
    sendGiftTicket: build.mutation<
      ApiRecord,
      { orderId: number; ticketIds: number[]; recipientIdentifier: string; note?: string }
    >({
      query: (body) => ({ url: '/gift-tickets', method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      invalidatesTags: ['Ticket', 'Order'],
    }),
    getGiftTickets: build.query<ApiRecord[], void>({
      query: () => '/gift-tickets',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: ['Ticket'],
    }),
    getChats: build.query<ApiRecord[], void>({
      query: () => '/chats',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: ['SupportCase'],
    }),
    sendChatMessage: build.mutation<
      ApiRecord,
      { chatId?: number; channel: 'support'; message: string }
    >({
      query: (body) => ({ url: '/chats/send', method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      invalidatesTags: ['SupportCase'],
    }),
    getChatMessages: build.query<ApiRecord[], string | number>({
      query: (chatId) => `/chats/${chatId}`,
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: ['SupportCase'],
    }),
    markChatsRead: build.mutation<unknown, Record<string, unknown> | void>({
      query: (body) => ({ url: '/chats/read', method: 'PUT', body: body ?? {} }),
      invalidatesTags: ['SupportCase'],
    }),
    getAdvertisements: build.query<ApiRecord[], void>({
      query: () => '/advertisements',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
    }),
    deleteAccount: build.mutation<unknown, { password: string }>({
      query: (body) => ({ url: '/account-deletion', method: 'DELETE', body }),
    }),
  }),
})

export const {
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useDeleteFavoriteMutation,
  useGetWalletQuery,
  useTopUpWalletMutation,
  useGetNotificationCategoriesQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetMyApplicationQuery,
  useApplyTalentMutation,
  useApplyVendorMutation,
  useGetCitiesQuery,
  useGetOfferedServicesQuery,
  useGetPerformanceCategoriesQuery,
  useGetMyReviewsQuery,
  useSubmitReviewMutation,
  useSendGiftTicketMutation,
  useGetGiftTicketsQuery,
  useGetChatsQuery,
  useSendChatMessageMutation,
  useGetChatMessagesQuery,
  useMarkChatsReadMutation,
  useGetAdvertisementsQuery,
  useDeleteAccountMutation,
} = accountApis
