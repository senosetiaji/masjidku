/*
  Warnings:

  - Added the required column `installationBill` to the `MasterDataPelanggan` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MasterDataPelanggan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "installationBill" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_MasterDataPelanggan" ("address", "createdAt", "id", "name", "phone", "updatedAt") SELECT "address", "createdAt", "id", "name", "phone", "updatedAt" FROM "MasterDataPelanggan";
DROP TABLE "MasterDataPelanggan";
ALTER TABLE "new_MasterDataPelanggan" RENAME TO "MasterDataPelanggan";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
