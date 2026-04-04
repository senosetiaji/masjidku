const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const workspaceRoot = path.resolve(__dirname, "..");
const tenantDir = path.join(workspaceRoot, "prisma", "tenants");

const pemasanganAutoWhere = {
  OR: [
    { description: { contains: "[AUTO_SOURCE:pam_pemasangan:" } },
    { description: { contains: "[AUTO_CUSTOMER:" } },
  ],
};

const toFileUrl = (absPath) => `file:${absPath.replace(/\\/g, "/")}`;

const getTenantDatabases = () => {
  if (!fs.existsSync(tenantDir)) return [];

  return fs
    .readdirSync(tenantDir)
    .filter((name) => name.toLowerCase().endsWith(".db"))
    .map((name) => {
      const absPath = path.join(tenantDir, name);
      return {
        name,
        absPath,
        url: toFileUrl(absPath),
      };
    });
};

const runCleanup = async ({ name, url }) => {
  const prisma = new PrismaClient({
    datasources: {
      db: { url },
    },
  });

  try {
    const before = await prisma.pamKas.count({ where: pemasanganAutoWhere });
    if (before === 0) {
      return { name, deleted: 0, before: 0 };
    }

    const result = await prisma.pamKas.deleteMany({ where: pemasanganAutoWhere });
    return { name, deleted: result.count || 0, before };
  } finally {
    await prisma.$disconnect();
  }
};

async function main() {
  const targets = getTenantDatabases();

  if (!targets.length) {
    console.log("Tidak ada database tenant (*.db) di prisma/tenants");
    return;
  }

  console.log(`Menjalankan cleanup pada ${targets.length} database tenant...`);

  let grandTotal = 0;
  for (const target of targets) {
    try {
      const result = await runCleanup(target);
      grandTotal += result.deleted;
      console.log(`- ${result.name}: terhapus ${result.deleted} baris`);
    } catch (error) {
      console.log(`- ${target.name}: gagal (${error.message || error})`);
    }
  }

  console.log(`Selesai. Total baris terhapus: ${grandTotal}`);
}

main().catch((error) => {
  console.error("Cleanup gagal:", error);
  process.exit(1);
});
