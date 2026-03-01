/*
  Warnings:

  - You are about to drop the column `yearsReceiving` on the `PenerimaZakat` table. All the data in the column will be lost.
  - Added the required column `receivingYear` to the `PenerimaZakat` table without a default value. This is not possible if the table is not empty.

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
    "amount" INTEGER NOT NULL,
    "receivingYear" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PenerimaZakat" ("address", "amount", "createdAt", "id", "name", "phone", "role", "updatedAt", "zakatType") SELECT "address", "amount", "createdAt", "id", "name", "phone", "role", "updatedAt", "zakatType" FROM "PenerimaZakat";
DROP TABLE "PenerimaZakat";
ALTER TABLE "new_PenerimaZakat" RENAME TO "PenerimaZakat";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
