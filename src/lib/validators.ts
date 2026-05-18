import { z } from "zod"

const phoneRegex = /^\+?[0-9][0-9\s-]{7,}[0-9]$/

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type LoginValues = z.infer<typeof loginSchema>

export const phoneOtpRequestSchema = z.object({
  phone: z.string().min(10, "Enter a valid phone number").regex(phoneRegex, "Enter a valid phone number"),
})

export const phoneOtpVerifySchema = phoneOtpRequestSchema.extend({
  code: z.string().regex(/^\d{6}$/, "Enter the 6 digit OTP"),
})

export const signupSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  company: z.string().optional(),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(phoneRegex, "Enter a valid phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export type SignUpValues = z.infer<typeof signupSchema>

export const signupVerifySchema = z.object({
  email: z.string().email("Enter a valid email address"),
  code: z.string().regex(/^\d{6}$/, "Enter the 6 digit verification code"),
})

export type SignUpVerifyValues = z.infer<typeof signupVerifySchema>

export const contactSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(phoneRegex, "Enter a valid phone number"),
  company: z.string().optional(),
  service: z.string().min(2, "Select a service"),
  location: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export type ContactValues = z.infer<typeof contactSchema>

export const manpowerCommonSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(phoneRegex, "Enter a valid phone number"),
  city: z.string().min(2, "Enter your city"),
  dob: z.string().optional(),
  availFrom: z.string().optional(),
  availTo: z.string().optional(),
  totalExp: z.string().optional(),
  prevExhibition: z.enum(["yes", "no"]).optional(),
})

export type ManpowerCommonValues = z.infer<typeof manpowerCommonSchema>
