import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
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
  ],
  endpoints: () => ({}),
})
