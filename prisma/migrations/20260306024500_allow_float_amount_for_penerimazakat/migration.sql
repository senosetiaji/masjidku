/*
  Warnings:

  - You are about to alter the column `amount` on the `PenerimaZakat` table. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PenerimaZakat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "zakatType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "receivingYear" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PenerimaZakat" ("address", "amount", "createdAt", "id", "name", "phone", "receivingYear", "role", "updatedAt", "zakatType") SELECT "address", "amount", "createdAt", "id", "name", "phone", "receivingYear", "role", "updatedAt", "zakatType" FROM "PenerimaZakat";
DROP TABLE "PenerimaZakat";
ALTER TABLE "new_PenerimaZakat" RENAME TO "PenerimaZakat";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
