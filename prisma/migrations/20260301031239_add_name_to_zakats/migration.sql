/*
  Warnings:

  - Added the required column `name` to the `Zakats` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Zakats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "zakatType" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Zakats" ("amount", "createdAt", "date", "description", "id", "type", "updatedAt", "zakatType") SELECT "amount", "createdAt", "date", "description", "id", "type", "updatedAt", "zakatType" FROM "Zakats";
DROP TABLE "Zakats";
ALTER TABLE "new_Zakats" RENAME TO "Zakats";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
