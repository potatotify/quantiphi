import "server-only";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
};

export function getExchangeRateApiKey(): string {
  const apiKey = process.env.EXCHANGERATE_API_KEY?.trim();

  if (!apiKey) {
    throw new ConfigError("ExchangeRate API is not configured.");
  }

  return apiKey;
}
