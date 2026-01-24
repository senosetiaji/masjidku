-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PamRutin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pelangganId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "previous_used" INTEGER NOT NULL,
    "current_used" INTEGER NOT NULL,
    "water_bill" INTEGER NOT NULL,
    "billAmount" INTEGER NOT NULL,
    "paidAmount" INTEGER NOT NULL,
    "paymentDate" DATETIME,
    "status" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PamRutin" ("billAmount", "createdAt", "current_used", "id", "month", "notes", "paidAmount", "paymentDate", "pelangganId", "previous_used", "status", "updatedAt", "water_bill", "year") SELECT "billAmount", "createdAt", "current_used", "id", "month", "notes", "paidAmount", "paymentDate", "pelangganId", "previous_used", "status", "updatedAt", "water_bill", "year" FROM "PamRutin";
DROP TABLE "PamRutin";
ALTER TABLE "new_PamRutin" RENAME TO "PamRutin";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
