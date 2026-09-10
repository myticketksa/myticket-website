import * as yup from 'yup'

export const signInSchema = yup.object({
  identifier: yup.string().trim().required('Enter your mobile number or email'),
  password: yup.string().required('Enter your password'),
  keepSignedIn: yup.boolean().default(true),
})

export type SignInValues = yup.InferType<typeof signInSchema>

export const registerSchema = yup.object({
  name: yup.string().trim().required('Enter your full name'),
  identity: yup.string().trim().required('Enter your mobile number or email'),
  password: yup
    .string()
    .min(8, 'Use at least 8 characters')
    .required('Create a password'),
  acceptedTerms: yup
    .boolean()
    .oneOf([true], 'Accept the Terms and Privacy Policy to continue')
    .required(),
})

export type RegisterValues = yup.InferType<typeof registerSchema>

export const forgotPasswordSchema = yup.object({
  email: yup.string().trim().email('Enter a valid email').required('Enter your email'),
})

export type ForgotPasswordValues = yup.InferType<typeof forgotPasswordSchema>

export const resetPasswordSchema = yup.object({
  email: yup.string().trim().email('Enter a valid email').required('Enter your email'),
  code: yup.string().trim().required('Enter the code we sent'),
  password: yup
    .string()
    .min(8, 'Use at least 8 characters')
    .required('Enter a new password'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
})

export type ResetPasswordValues = yup.InferType<typeof resetPasswordSchema>

export const otpVerifySchema = yup.object({
  identifier: yup.string().trim().required(),
  code: yup.string().trim().min(4).required('Enter the one-time code'),
})

export type OtpVerifyValues = yup.InferType<typeof otpVerifySchema>

/** Split the single identity field into email vs phone for register. */
export function splitIdentity(identity: string): { email?: string; phone?: string } {
  const value = identity.trim()
  if (value.includes('@')) return { email: value }
  const digits = value.replace(/\D/g, '')
  const phone = digits.startsWith('966') ? digits : `966${digits.replace(/^0/, '')}`
  return { phone }
}
