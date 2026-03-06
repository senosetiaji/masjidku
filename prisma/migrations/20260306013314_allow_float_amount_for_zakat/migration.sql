/*
  Warnings:

  - You are about to alter the column `amount` on the `Zakats` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Zakats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "zakatType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Zakats" ("amount", "createdAt", "date", "description", "id", "name", "type", "updatedAt", "zakatType") SELECT "amount", "createdAt", "date", "description", "id", "name", "type", "updatedAt", "zakatType" FROM "Zakats";
DROP TABLE "Zakats";
ALTER TABLE "new_Zakats" RENAME TO "Zakats";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
