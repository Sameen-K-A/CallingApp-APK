import { z } from "zod";

// Phone number verification screen validation and type
// =================================================================================
export const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be 10 digits")
    .max(10, "Phone number must be 10 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits")
    .refine((val) => val.length === 10, {
      message: "Please enter a valid 10-digit phone number",
    }),
});

export type PhoneFormData = z.infer<typeof phoneSchema>;

// OTP verification screen validation and type
// ===================================================================================
export const otpSchema = z.object({
  otp: z.string().length(5, 'Please enter a valid 5-digit OTP'),
});

export type OTPFormData = z.infer<typeof otpSchema>;


// complete profile setup verification screen validation and type
// ===================================================================================
export const profileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, { message: "Name must be at least 3 characters" })
      .max(50, { message: "Name cannot exceed 50 characters" })
      .regex(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces" }),

    dob: z.date().optional(),

    gender: z.enum(["male", "female", "other"]).optional(),

    wantsToBeTelecaller: z.boolean(),

    about: z.string().trim().optional(),

    language: z.string(),
  })
  .superRefine((data, ctx) => {
    // Check if DOB is provided
    if (!data.dob) {
      ctx.addIssue({
        code: "custom",
        message: "Date of birth is required",
        path: ["dob"],
      });
    } else {
      // Validate age if DOB is provided
      const age = Math.floor(
        (new Date().getTime() - data.dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      if (age < 18) {
        ctx.addIssue({
          code: "custom",
          message: "You must be at least 18 years old",
          path: ["dob"],
        });
      }
    }

    // Check if gender is provided
    if (!data.gender) {
      ctx.addIssue({
        code: "custom",
        message: "Gender is required",
        path: ["gender"],
      });
    }

    // Check if language is provided
    if (!data.language || data.language.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Language is required",
        path: ["language"],
      });
    }

    // Only females can be telecallers
    if (data.wantsToBeTelecaller && data.gender !== "female") {
      ctx.addIssue({
        code: "custom",
        message: "Sorry, only female users can register as a telecaller",
        path: ["wantsToBeTelecaller"],
      });
    }

    // About is required for telecallers
    if (data.wantsToBeTelecaller) {
      if (!data.about || data.about.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "About section is required for telecallers",
          path: ["about"],
        });
      } else if (data.about.length < 50) {
        ctx.addIssue({
          code: "custom",
          message: "About section must be at least 50 characters",
          path: ["about"],
        });
      } else if (data.about.length > 500) {
        ctx.addIssue({
          code: "custom",
          message: "About section cannot exceed 500 characters",
          path: ["about"],
        });
      }
    }
  });

export type ProfileFormData = z.infer<typeof profileSchema>;

// Re-apply schema for rejected telecallers
// ==========================================================================================================
export const reapplySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces" }),

  dob: z.date().optional(),

  language: z.string().min(1, { message: "Language is required" }),

  about: z
    .string()
    .trim()
    .min(50, { message: "About section must be at least 50 characters" })
    .max(500, { message: "About section cannot exceed 500 characters" }),
}).superRefine((data, ctx) => {
  // Check if DOB is provided
  if (!data.dob) {
    ctx.addIssue({
      code: "custom",
      message: "Date of birth is required",
      path: ["dob"],
    });
  } else {
    // Validate age if DOB is provided
    const age = Math.floor(
      (new Date().getTime() - data.dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    if (age < 18) {
      ctx.addIssue({
        code: "custom",
        message: "You must be at least 18 years old",
        path: ["dob"],
      });
    }
  }
});

export type ReapplyFormData = z.infer<typeof reapplySchema>;