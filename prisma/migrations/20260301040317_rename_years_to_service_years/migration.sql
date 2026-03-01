/*
  Warnings:

  - You are about to drop the column `yearsOfService` on the `PanitiaZakat` table. All the data in the column will be lost.
  - Added the required column `serviceYears` to the `PanitiaZakat` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PanitiaZakat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "serviceYears" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PanitiaZakat" ("createdAt", "id", "name", "phone", "role", "updatedAt") SELECT "createdAt", "id", "name", "phone", "role", "updatedAt" FROM "PanitiaZakat";
DROP TABLE "PanitiaZakat";
ALTER TABLE "new_PanitiaZakat" RENAME TO "PanitiaZakat";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
