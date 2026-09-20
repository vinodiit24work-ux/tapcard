import { z } from 'zod'

export const email = z.string().trim().toLowerCase().email('Enter a valid email address.').max(200)
export const password = z.string().min(8, 'Use at least 8 characters.').max(200)

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(100),
  email,
  password,
})

export const loginSchema = z.object({ email, password: z.string().min(1, 'Enter your password.') })
export const forgotSchema = z.object({ email })
export const resetSchema = z.object({ token: z.string().min(10), password })
export const verifySchema = z.object({ token: z.string().min(10) })
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: password })
export const updateAccountSchema = z.object({ name: z.string().trim().min(2).max(100).optional(), email: email.optional() })
