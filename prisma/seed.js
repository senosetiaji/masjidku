const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

// Construct with an explicit options object to satisfy this build's runtime check
const prisma = new PrismaClient({});

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const existing = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  if (existing) {
    console.log("⚠️ Superadmin already exists");
    return;
  }

  await prisma.user.create({
    data: {
      name: "Super Admin",
      phone: "08123456789",
      jabatan: "Administrator",
      username: "admin",
      password: passwordHash,
      role: "superadmin",
    },
  });

  console.log("✅ Superadmin created (username: admin, password: admin123)");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
