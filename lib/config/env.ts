export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
};

export function getExchangeRateApiKey(): string {
  const apiKey = process.env.EXCHANGERATE_API_KEY;

  if (!apiKey) {
    throw new Error("EXCHANGERATE_API_KEY is not configured. Copy .env.example to .env and add your key.");
  }

  return apiKey;
}
