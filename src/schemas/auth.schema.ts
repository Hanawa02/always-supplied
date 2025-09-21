import { z } from "zod"

export const login_schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
  remember: z.boolean().optional().default(false),
})

export type LoginFormData = z.infer<typeof login_schema>