-- CreateTable
CREATE TABLE "PamRutin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pelangganId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "previous_used" INTEGER NOT NULL,
    "current_used" INTEGER NOT NULL,
    "water_bill" INTEGER NOT NULL,
    "billAmount" INTEGER NOT NULL,
    "paidAmount" INTEGER NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
