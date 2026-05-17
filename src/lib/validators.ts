import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Use a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  name: z.string().min(2).max(80).optional(),
});

export const noteSchema = z.object({
  title: z.string().min(1).max(140),
  content: z.string().max(50000).default(""),
  category: z.string().min(1).max(60).default("Personal"),
  archived: z.boolean().default(false),
  tags: z.array(z.string().min(1).max(32)).max(8).default([]),
});

export const aiSchema = z.object({
  type: z.enum(["summary", "actions", "title"]),
});
