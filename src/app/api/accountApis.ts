import { baseApi } from './baseApi'
import { asList, unwrapData } from '@/lib/api/unwrap'
import { normalizeWalletResponse } from '@/lib/api/mappers/wallet'

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
    getWallet: build.query<
      { transactions: ApiRecord[]; pagination?: ApiRecord },
      void
    >({
      query: () => '/wallet',
      transformResponse: (response: unknown) => normalizeWalletResponse(response),
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
        comment?: string
        review?: string
      }
    >({
      query: ({ review: _legacyReview, ...body }) => ({
        url: '/reviews',
        method: 'POST',
        // Prefer `comment` for guest submissions; omit public `review` unless explicitly set.
        body: {
          type: body.type,
          id: body.id,
          rating: body.rating,
          name: body.name,
          ...(body.comment ? { comment: body.comment } : {}),
          ...(_legacyReview ? { review: _legacyReview } : {}),
        },
      }),
      invalidatesTags: (_r, _e, body) => [
        'Review',
        { type: 'Review', id: `${body.type}-${body.id}` },
        ...(body.type === 'talent'
          ? ([{ type: 'Talent', id: String(body.id) }] as const)
          : []),
        ...(body.type === 'experience'
          ? ([{ type: 'Experience', id: String(body.id) }] as const)
          : []),
      ],
    }),
    sendGiftTicket: build.mutation<
      ApiRecord,
      { orderId: number; ticketIds: number[]; recipientIdentifier: string; note?: string }
    >({
      query: (body) => ({ url: '/gift-tickets', method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      invalidatesTags: [
        'Ticket',
        'Order',
        { type: 'Ticket', id: 'GIFTS' },
      ],
    }),
    /** Recipient claims a gift — `POST /gift-tickets/{giftTicketId}` (no body). */
    claimGiftTicket: build.mutation<ApiRecord, { giftTicketId: string | number }>({
      query: ({ giftTicketId }) => ({
        url: `/gift-tickets/${giftTicketId}`,
        method: 'POST',
      }),
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      invalidatesTags: [
        'Ticket',
        'Order',
        { type: 'Ticket', id: 'GIFTS' },
      ],
    }),
    /** Sender + recipient list — `GET /gift-tickets`. */
    getGiftTickets: build.query<ApiRecord[], void>({
      query: () => '/gift-tickets',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map((gift) => ({
                type: 'Ticket' as const,
                id: `gift-${String(gift.id ?? gift.giftTicketId ?? '')}`,
              })),
              { type: 'Ticket', id: 'GIFTS' },
            ]
          : [{ type: 'Ticket', id: 'GIFTS' }],
    }),
    /** Recipient gift detail — `GET /gift-tickets/{giftTicketId}`. */
    getGiftTicketDetails: build.query<ApiRecord, string | number>({
      query: (giftTicketId) => `/gift-tickets/${giftTicketId}`,
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      providesTags: (_r, _e, id) => [
        { type: 'Ticket', id: `gift-${String(id)}` },
        { type: 'Ticket', id: 'GIFTS' },
      ],
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
    updateGuestProfile: build.mutation<
      ApiRecord,
      {
        name: string
        email: string
        phone: string
        current_password: string
        password?: string
      }
    >({
      query: (body) => ({
        url: '/guest',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
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
  useClaimGiftTicketMutation,
  useGetGiftTicketsQuery,
  useGetGiftTicketDetailsQuery,
  useGetChatsQuery,
  useSendChatMessageMutation,
  useGetChatMessagesQuery,
  useMarkChatsReadMutation,
  useGetAdvertisementsQuery,
  useDeleteAccountMutation,
  useUpdateGuestProfileMutation,
} = accountApis
