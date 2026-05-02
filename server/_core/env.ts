export const ENV = {
  appId: process.env.VITE_APP_ID ?? "nexus-agent",
  cookieSecret: process.env.JWT_SECRET ?? "nexus-secret-key",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  hfApiKey: process.env.HF_API_KEY ?? "",
};
