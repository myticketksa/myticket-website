import * as yup from 'yup'
import { normalizeAuthIdentifier, normalizeSaudiPhone } from '@/lib/api/formPayload'

/** Locale-aware message lookup (i18next `t` or a plain function). */
export type ValidationMessage = (key: string) => string

export function createSignInSchema(t: ValidationMessage) {
  return yup.object({
    identifier: yup.string().trim().required(t('enterMobileOrEmail')),
    password: yup.string().required(t('enterPassword')),
    keepSignedIn: yup.boolean().default(true),
  })
}

export type SignInValues = yup.InferType<ReturnType<typeof createSignInSchema>>

/** @deprecated Prefer createSignInSchema(t) for locale-aware messages. */
export const signInSchema = createSignInSchema((key) => key)

/** Matches Postman `POST /auth/register`: name, email, phone, password. */
export function createRegisterSchema(t: ValidationMessage) {
  return yup.object({
    name: yup.string().trim().required(t('enterFullName')),
    email: yup.string().trim().email(t('enterValidEmail')).required(t('enterEmail')),
    phone: yup
      .string()
      .trim()
      .required(t('enterMobile'))
      .test('phone', t('enterValidSaudiMobile'), (value) => {
        const digits = normalizeSaudiPhone(value ?? '')
        return /^9665\d{8}$/.test(digits)
      }),
    password: yup.string().min(8, t('passwordMin')).required(t('createPassword')),
    acceptedTerms: yup.boolean().oneOf([true], t('acceptTerms')).required(),
  })
}

export type RegisterValues = yup.InferType<ReturnType<typeof createRegisterSchema>>

/** @deprecated Prefer createRegisterSchema(t). */
export const registerSchema = createRegisterSchema((key) => key)

export function createForgotPasswordSchema(t: ValidationMessage) {
  return yup.object({
    email: yup.string().trim().email(t('enterValidEmail')).required(t('enterEmail')),
  })
}

export type ForgotPasswordValues = yup.InferType<ReturnType<typeof createForgotPasswordSchema>>

/** @deprecated Prefer createForgotPasswordSchema(t). */
export const forgotPasswordSchema = createForgotPasswordSchema((key) => key)

export function createResetPasswordSchema(t: ValidationMessage) {
  return yup.object({
    email: yup.string().trim().email(t('enterValidEmail')).required(t('enterEmail')),
    code: yup.string().trim().required(t('enterCode')),
    password: yup.string().min(8, t('passwordMin')).required(t('enterNewPassword')),
    password_confirmation: yup
      .string()
      .oneOf([yup.ref('password')], t('passwordsMustMatch'))
      .required(t('confirmPassword')),
  })
}

export type ResetPasswordValues = yup.InferType<ReturnType<typeof createResetPasswordSchema>>

/** @deprecated Prefer createResetPasswordSchema(t). */
export const resetPasswordSchema = createResetPasswordSchema((key) => key)

export function createOtpVerifySchema(t: ValidationMessage) {
  return yup.object({
    identifier: yup.string().trim().required(),
    code: yup.string().trim().min(4).required(t('enterOtp')),
  })
}

export type OtpVerifyValues = yup.InferType<ReturnType<typeof createOtpVerifySchema>>

/** @deprecated Prefer createOtpVerifySchema(t). */
export const otpVerifySchema = createOtpVerifySchema((key) => key)

/** @deprecated Prefer explicit email + phone fields for register. */
export function splitIdentity(identity: string): { email?: string; phone?: string } {
  const value = identity.trim()
  if (value.includes('@')) return { email: value }
  const phone = normalizeSaudiPhone(value)
  return phone ? { phone } : {}
}

export function toRegisterPayload(values: RegisterValues) {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: normalizeSaudiPhone(values.phone),
    password: values.password,
  }
}

export function toLoginIdentifier(identifier: string) {
  return normalizeAuthIdentifier(identifier)
}
