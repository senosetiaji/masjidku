-- CreateTable
CREATE TABLE "PamPemasangan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pelangganId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "amount" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
