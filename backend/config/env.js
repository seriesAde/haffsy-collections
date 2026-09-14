export function readConfig(env = process.env) {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32)
    throw new Error("JWT_SECRET must contain at least 32 characters.");
  if (!env.MONGODB_URI || !env.MONGODB_URI.startsWith("mongodb"))
    throw new Error("MONGODB_URI is required.");
  const origin = env.CLIENT_ORIGIN || "http://localhost:5173";
  if (new URL(origin).origin !== origin)
    throw new Error(
      "CLIENT_ORIGIN must be an exact origin without a trailing slash.",
    );
  return {
    production: env.NODE_ENV === "production",
    port: Number(env.PORT || 4000),
    origin,
    mongoUri: env.MONGODB_URI,
    jwtSecret: env.JWT_SECRET,
  };
}
