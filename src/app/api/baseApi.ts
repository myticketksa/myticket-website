import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
    prepareHeaders(headers, { getState }) {
      const token = (getState() as { auth: { token: string | null } }).auth?.token
      if (token) headers.set('Authorization', `Bearer ${token}`)
      headers.set('Accept', 'application/json')
      return headers
    },
  }),
  tagTypes: [
    'Event',
    'Talent',
    'Experience',
    'Vendor',
    'Organizer',
    'Auction',
    'Ticket',
    'Order',
    'User',
    'Notification',
    'Review',
    'SupportCase',
    'Application',
    'Wallet',
    'Favorite',
  ],
  endpoints: () => ({}),
})
