import { baseApi } from './baseApi'
import type { AuthUser } from '@/features/auth/authSlice'
import { unwrapData } from '@/lib/api/unwrap'

export interface AuthSessionPayload {
  user: AuthUser
  access_token: string
  token_type?: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<
      unknown,
      { name: string; email: string; phone: string; password: string }
    >({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    verifyEmail: build.mutation<AuthSessionPayload, { email: string; code: string }>({
      query: (body) => ({
        url: '/auth/register/verify-email',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<AuthSessionPayload>(response),
    }),
    login: build.mutation<AuthSessionPayload, { identifier: string; password: string }>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<AuthSessionPayload>(response),
    }),
    forgotPassword: build.mutation<unknown, { email: string }>({
      query: (body) => ({
        url: '/auth/login/password/forgot',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: build.mutation<
      unknown,
      { email: string; code: string; password: string; password_confirmation: string }
    >({
      query: (body) => ({
        url: '/auth/login/password/reset',
        method: 'POST',
        body,
      }),
    }),
    requestLoginCode: build.mutation<unknown, { identifier: string }>({
      query: (body) => ({
        url: '/auth/login/code/request',
        method: 'POST',
        body,
      }),
    }),
    verifyLoginCode: build.mutation<AuthSessionPayload, { identifier: string; code: string }>({
      query: (body) => ({
        url: '/auth/login/code/verify',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<AuthSessionPayload>(response),
    }),
    logout: build.mutation<unknown, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRequestLoginCodeMutation,
  useVerifyLoginCodeMutation,
  useLogoutMutation,
} = authApi
