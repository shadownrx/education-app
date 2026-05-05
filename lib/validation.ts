// Input validation utilities
import { ZodError } from "zod";
import { z } from "zod";

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
  code: z.string().min(1, "Subject code is required").max(20),
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

// Validate and sanitize user input
// Using generics to automatically infer the type from the Zod schema
export function validateInput<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      throw new Error(`Validation failed: ${messages.join(", ")}`);
    }
    throw error;
  }
}

// Sanitize object to prevent NoSQL injection
export function sanitizeObject(obj: any): any {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Prevent $ and . in keys (NoSQL injection prevention)
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }
    sanitized[key] = sanitizeObject(value);
  }

  return sanitized;
}
