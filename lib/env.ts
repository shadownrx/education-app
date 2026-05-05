// Validate required environment variables
function getEnvVariable(name: string, defaultValue?: string): string {
  const value = process.env[name];

  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value || defaultValue || "";
}

export const ENV = {
  JWT_SECRET: getEnvVariable(
    "JWT_SECRET",
    process.env.NODE_ENV === "production" ? undefined : "dev-secret-change-in-production"
  ),
  MONGODB_URI: getEnvVariable(
    "MONGODB_URI",
    "mongodb://localhost:27017/education-app"
  ),
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
} as const;

// Ensure critical values are set in production
if (process.env.NODE_ENV === "production") {
  if (process.env.JWT_SECRET === "dev-secret-change-in-production") {
    throw new Error("JWT_SECRET must be set to a secure value in production");
  }
}
