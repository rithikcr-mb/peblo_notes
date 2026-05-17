import { z } from "zod";

const placeholderValues = new Set([
  "your-long-random-secret",
  "replace-with-a-strong-random-secret",
  "your-generated-jwt-secret-key-here",
]);

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required.").url("DATABASE_URL must be a valid connection URL."),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters.")
    .refine((value) => !placeholderValues.has(value), "NEXTAUTH_SECRET must not use a placeholder value."),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL.").optional(),
  GEMINI_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
});

if (!parsed.success) {
  const message = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment configuration. ${message}`);
}

export const env = parsed.data;
