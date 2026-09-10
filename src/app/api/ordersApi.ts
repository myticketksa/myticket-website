import { baseApi } from './baseApi'
import { asList, unwrapData } from '@/lib/api/unwrap'

export type ApiRecord = Record<string, unknown>

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation<
      ApiRecord,
      {
        eventId: string | number
        body: {
          items?: { ticketId: number; quantity: number }[]
          beneficiaries?: { quantity_id: number; name: string }[]
          seatIds?: number[]
          holdId?: string
          ticketId?: number
          quantity?: number
        }
      }
    >({
      query: ({ eventId, body }) => ({
        url: `/tickets/events/${eventId}/orders`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      invalidatesTags: ['Order', 'Ticket'],
    }),
    cancelOrder: build.mutation<ApiRecord, string | number>({
      query: (orderId) => ({
        url: `/tickets/orders/${orderId}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order', 'Ticket'],
    }),
    payOrder: build.mutation<ApiRecord, { orderId: number; brand: 'CREDIT' | 'WALLET' }>({
      query: (body) => ({
        url: '/tickets/orders/pay',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      invalidatesTags: ['Order', 'Ticket', 'Wallet'],
    }),
    getOrders: build.query<ApiRecord[], void>({
      query: () => '/tickets/orders',
      transformResponse: (response: unknown) => asList<ApiRecord>(response),
      providesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    getOrderDetails: build.query<ApiRecord, string | number>({
      query: (orderId) => `/tickets/orders/${orderId}`,
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      providesTags: (_r, _e, id) => [{ type: 'Order', id: String(id) }],
    }),
    applyPromoCode: build.mutation<ApiRecord, { orderId: number; promoCode: string }>({
      query: (body) => ({
        url: '/tickets/orders/promo/apply',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<ApiRecord>(response) ?? {},
      invalidatesTags: ['Order'],
    }),
  }),
})

export const {
  useCreateOrderMutation,
  useCancelOrderMutation,
  usePayOrderMutation,
  useGetOrdersQuery,
  useGetOrderDetailsQuery,
  useApplyPromoCodeMutation,
} = ordersApi
