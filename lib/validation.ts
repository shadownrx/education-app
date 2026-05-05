// Input validation utilities
import { ZodError } from "zod";
import { z } from "zod";
import { ValidationError } from "./errors";

export const emailSchema = z.string().email("Invalid email format").toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be at most 100 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters");

export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

// Validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(100),
  code: z.string().min(1, "Subject code is required").max(20).optional(),
  institution: z.string().min(1, "Institution is required").max(150).optional(),
});

export const studentSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional(),
  status: z.enum(["present", "absent", "late"]).optional(),
});

export const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  dueDate: z.string().datetime().optional(),
  subjectId: mongoIdSchema,
});

export const messageSchema = z.object({
  recipientId: mongoIdSchema,
  subjectId: mongoIdSchema,
  content: z.string().trim().min(1, "Message content cannot be empty").max(5000),
  conversationId: z.string().trim().min(1).max(200),
});

export const aiPromptSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required").max(4000),
});

export const aiActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("CREATE_ASSIGNMENT"),
    data: z.object({
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().min(1).max(5000),
      deadline: z.string().trim().min(1).max(50),
    }),
  }),
  z.object({
    type: z.literal("CREATE_LESSON_PLAN"),
    data: z.object({
      title: z.string().trim().min(1).max(200),
      week: z.coerce.number().int().min(1).max(60),
      topics: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
      date: z.string().trim().min(1).max(50),
    }),
  }),
  z.object({
    type: z.literal("FEEDBACK"),
    data: z.object({
      studentName: z.string().trim().min(1).max(100),
      text: z.string().trim().min(1).max(2000),
    }),
  }),
]);

// Validate and sanitize user input
// Using generics to automatically infer the type from the Zod schema
export function validateInput<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
      throw new ValidationError(`Validation failed: ${messages.join(", ")}`);
    }
    throw error;
  }
}

// Sanitize object to prevent NoSQL injection
export function sanitizeObject(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Prevent $ and . in keys (NoSQL injection prevention)
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }
    sanitized[key] = sanitizeObject(value);
  }

  return sanitized;
}
