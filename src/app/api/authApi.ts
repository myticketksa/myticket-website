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
    // Google sign-in: the Firebase ID token from the Google popup.
    firebaseLogin: build.mutation<AuthSessionPayload, { idToken: string }>({
      query: (body) => ({
        url: '/auth/login/firebase',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<AuthSessionPayload>(response),
    }),
    // Sign-in with a Saudi mobile and a texted code (3 Nov 2026). Verifying
    // signs a known number in; a new number returns needsProfile and a
    // signupToken, and phoneComplete makes the account.
    // A new sign-up code to the email the account was made with.
    resendSignupCode: build.mutation<unknown, { email: string }>({
      query: (body) => ({ url: '/auth/register/resend-email', method: 'POST', body }),
    }),
    phoneRequest: build.mutation<{ resendIn?: number }, { phone: string }>({
      query: (body) => ({ url: '/auth/login/phone/request', method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapData<{ resendIn?: number }>(response),
    }),
    phoneVerify: build.mutation<
      AuthSessionPayload | { needsProfile: true; signupToken: string },
      { phone: string; code: string }
    >({
      query: (body) => ({ url: '/auth/login/phone/verify', method: 'POST', body }),
      transformResponse: (response: unknown) =>
        unwrapData<AuthSessionPayload | { needsProfile: true; signupToken: string }>(response),
    }),
    phoneComplete: build.mutation<AuthSessionPayload, { signupToken: string; name: string; email: string }>({
      query: (body) => ({ url: '/auth/login/phone/complete', method: 'POST', body }),
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
  useFirebaseLoginMutation,
  useResendSignupCodeMutation,
  usePhoneRequestMutation,
  usePhoneVerifyMutation,
  usePhoneCompleteMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRequestLoginCodeMutation,
  useVerifyLoginCodeMutation,
  useLogoutMutation,
} = authApi
