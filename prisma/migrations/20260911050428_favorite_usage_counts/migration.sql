-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FavoritePair" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "baseCurrency" TEXT NOT NULL,
    "targetCurrency" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_FavoritePair" ("baseCurrency", "createdAt", "id", "targetCurrency", "updatedAt") SELECT "baseCurrency", "createdAt", "id", "targetCurrency", "updatedAt" FROM "FavoritePair";
DROP TABLE "FavoritePair";
ALTER TABLE "new_FavoritePair" RENAME TO "FavoritePair";
CREATE INDEX "FavoritePair_createdAt_idx" ON "FavoritePair"("createdAt");
CREATE INDEX "FavoritePair_usageCount_lastUsedAt_idx" ON "FavoritePair"("usageCount", "lastUsedAt");
CREATE UNIQUE INDEX "FavoritePair_baseCurrency_targetCurrency_key" ON "FavoritePair"("baseCurrency", "targetCurrency");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
