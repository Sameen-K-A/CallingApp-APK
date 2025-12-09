import { z } from "zod";

export const editTelecallerProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces" }),

  language: z
    .string()
    .min(1, { message: "Language is required" }),

  about: z
    .string()
    .trim()
    .min(50, { message: "About must be at least 50 characters" })
    .max(500, { message: "About cannot exceed 500 characters" }),

  profile: z
    .string()
    .optional(),
});

export type EditTelecallerProfileFormData = z.infer<typeof editTelecallerProfileSchema>;