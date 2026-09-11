-- CreateIndex
CREATE INDEX "ConversionHistory_createdAt_idx" ON "ConversionHistory"("createdAt");

-- CreateIndex
CREATE INDEX "ConversionHistory_baseCurrency_targetCurrency_createdAt_idx" ON "ConversionHistory"("baseCurrency", "targetCurrency", "createdAt");

-- CreateIndex
CREATE INDEX "FavoritePair_createdAt_idx" ON "FavoritePair"("createdAt");
