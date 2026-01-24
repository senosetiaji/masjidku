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
  } else {
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

  const pelangganSeed = [
    {
      name: "Juni",
      address: "Larangan, Purbowangi",
      phone: "",
      createdAt: new Date("2024-06-10T07:23:45.123Z"),
      updatedAt: new Date("2024-06-10T07:23:45.123Z"),
    },
    {
      name: "Aris",
      address: "Larangan, Purbowangi",
      phone: "",
      createdAt: new Date("2024-06-10T07:23:45.123Z"),
      updatedAt: new Date("2024-06-10T07:23:45.123Z"),
    },
    {
      name: "Yatin",
      address: "Larangan, Purbowangi",
      phone: "",
      createdAt: new Date("2024-06-10T07:23:45.123Z"),
      updatedAt: new Date("2024-06-10T07:23:45.123Z"),
    },
    {
      name: "Tarmuji",
      address: "Larangan, Purbowangi",
      phone: "",
      createdAt: new Date("2024-06-10T07:23:45.123Z"),
      updatedAt: new Date("2024-06-10T07:23:45.123Z"),
    },
    {
      name: "Parmun",
      address: "Larangan, Purbowangi",
      phone: "",
      createdAt: new Date("2024-06-10T07:23:45.123Z"),
      updatedAt: new Date("2024-06-10T07:23:45.123Z"),
    },
    {
      name: "Surat",
      address: "Larangan, Purbowangi",
      phone: "",
      createdAt: new Date("2024-06-10T07:23:45.123Z"),
      updatedAt: new Date("2024-06-10T07:23:45.123Z"),
    },
    {
      name: "Seno",
      address: "Larangan, Purbowangi",
      phone: "",
      createdAt: new Date("2024-06-10T07:23:45.123Z"),
      updatedAt: new Date("2024-06-10T07:23:45.123Z"),
    },
  ];

  const pelangganCount = await prisma.masterDataPelanggan.count();
  if (pelangganCount === 0) {
    await prisma.$transaction(
      pelangganSeed.map((data) => prisma.masterDataPelanggan.create({ data }))
    );
    console.log("✅ MasterDataPelanggan seeded");
  } else {
    console.log("⚠️ MasterDataPelanggan already seeded");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
