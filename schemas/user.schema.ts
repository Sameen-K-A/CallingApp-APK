import { z } from "zod";

export const editUserProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces" }),

  language: z
    .string()
    .min(1, { message: "Language is required" }),

  profile: z
    .string()
    .optional(),
});

export type EditUserProfileFormData = z.infer<typeof editUserProfileSchema>;