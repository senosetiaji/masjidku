const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");

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
        id: "00000000-0000-0000-0000-000000000001",
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

  const sidebarPermissions = {
    dashboard: [
      { name: "/dashboard", description: "Akses menu dan halaman Dashboard" },
    ],
    masterData: [
      { name: "/master-data/pelanggan-pam", description: "Akses menu pelanggan PAM" },
      { name: "/master-data/pelanggan-pam/create", description: "Akses halaman tambah pelanggan PAM" },
      { name: "/master-data/pelanggan-pam/edit", description: "Akses halaman edit pelanggan PAM" },
    ],
    takmeer: [
      { name: "/takmeer", description: "Akses menu takmeer" },
      { name: "/takmeer/create", description: "Akses halaman tambah takmeer" },
      { name: "/takmeer/edit", description: "Akses halaman edit takmeer" },
    ],
    keuangan: [
      { name: "/keuangan/laporan-keuangan", description: "Akses menu laporan keuangan" },
      { name: "/keuangan/create", description: "Akses halaman input data keuangan" },
      { name: "/keuangan/edit", description: "Akses halaman edit data keuangan" },
    ],
    inventaris: [
      { name: "/inventaris/laporan-inventaris", description: "Akses menu laporan inventaris" },
      { name: "/inventaris/create", description: "Akses halaman input inventaris" },
      { name: "/inventaris/edit", description: "Akses halaman edit inventaris" },
    ],
    zakat: [
      { name: "/zakat", description: "Akses menu laporan zakat" },
      { name: "/zakat/create", description: "Akses halaman input zakat" },
      { name: "/zakat/edit", description: "Akses halaman edit zakat" },
      { name: "/zakat/panitia", description: "Akses menu panitia zakat" },
      { name: "/zakat/panitia/create", description: "Akses halaman tambah panitia zakat" },
      { name: "/zakat/panitia/edit", description: "Akses halaman edit panitia zakat" },
      { name: "/mustahik", description: "Akses menu mustahik" },
      { name: "/mustahik/create", description: "Akses halaman input mustahik" },
      { name: "/mustahik/edit", description: "Akses halaman edit mustahik" },
    ],
    pam: [
      { name: "/pam/pemasangan", description: "Akses menu pemasangan PAM" },
      { name: "/pam/pemasangan/create", description: "Akses halaman tambah pemasangan PAM" },
      { name: "/pam/pemasangan/edit", description: "Akses halaman edit pemasangan PAM" },
      { name: "/pam/biaya-rutinan", description: "Akses menu biaya rutinan PAM" },
      { name: "/pam/biaya-rutinan/create", description: "Akses halaman tambah biaya rutinan PAM" },
      { name: "/pam/biaya-rutinan/edit", description: "Akses halaman edit biaya rutinan PAM" },
      { name: "/pam/kas", description: "Akses menu kas PAM" },
      { name: "/pam/kas/create", description: "Akses halaman tambah kas PAM" },
      { name: "/pam/kas/edit", description: "Akses halaman edit kas PAM" },
    ],
    settings: [
      { name: "/settings/role-access", description: "Akses menu role access" },
      { name: "/settings/permissions", description: "Akses menu permissions" },
    ],
  };

  const allPermissions = [
    ...sidebarPermissions.dashboard,
    ...sidebarPermissions.masterData,
    ...sidebarPermissions.takmeer,
    ...sidebarPermissions.keuangan,
    ...sidebarPermissions.inventaris,
    ...sidebarPermissions.zakat,
    ...sidebarPermissions.pam,
    ...sidebarPermissions.settings,
  ];

  const rolePermissionMap = {
    admin: allPermissions,
    ketua: [
      ...sidebarPermissions.dashboard,
      ...sidebarPermissions.keuangan.filter((p) => p.name === "/keuangan/laporan-keuangan"),
      ...sidebarPermissions.inventaris.filter((p) => p.name === "/inventaris/laporan-inventaris"),
      ...sidebarPermissions.zakat.filter((p) => ["/zakat", "/zakat/panitia", "/mustahik"].includes(p.name)),
      ...sidebarPermissions.pam.filter((p) => ["/pam/pemasangan", "/pam/biaya-rutinan", "/pam/kas"].includes(p.name)),
    ],
    sekretaris: [
      ...sidebarPermissions.dashboard,
      ...sidebarPermissions.masterData,
      ...sidebarPermissions.takmeer,
      ...sidebarPermissions.inventaris,
      ...sidebarPermissions.zakat.filter((p) => ["/zakat/panitia", "/mustahik", "/mustahik/create", "/mustahik/edit"].includes(p.name)),
    ],
    bendahara: [
      ...sidebarPermissions.dashboard,
      ...sidebarPermissions.keuangan,
      ...sidebarPermissions.pam,
      ...sidebarPermissions.zakat,
    ],
  };

  const roleDescriptions = {
    admin: "Akses penuh ke semua menu dan halaman.",
    ketua: "Akses monitoring laporan utama dan data ringkasan.",
    sekretaris: "Akses pengelolaan data administratif dan inventaris.",
    bendahara: "Akses pengelolaan keuangan masjid, PAM, dan zakat.",
  };

  for (const [roleName, permissions] of Object.entries(rolePermissionMap)) {
    let role = await prisma.roles.findFirst({ where: { name: roleName } });

    if (!role) {
      role = await prisma.roles.create({
        data: {
          id: randomUUID(),
          name: roleName,
          description: roleDescriptions[roleName] || "",
        },
      });
    } else {
      await prisma.roles.update({
        where: { id: role.id },
        data: {
          description: roleDescriptions[roleName] || role.description,
        },
      });
    }

    await prisma.permissions.deleteMany({ where: { role_id: role.id } });
    if (permissions.length > 0) {
      await prisma.$transaction(
        permissions.map((permission) =>
          prisma.permissions.create({
            data: {
              id: randomUUID(),
              role_id: role.id,
              name: permission.name,
              description: permission.description,
            },
          })
        )
      );
    }
  }

  const staleRoles = await prisma.roles.findMany({
    where: {
      name: { notIn: Object.keys(rolePermissionMap) },
    },
    select: { id: true, name: true },
  });

  if (staleRoles.length > 0) {
    const staleRoleIds = staleRoles.map((role) => role.id);
    await prisma.permissions.deleteMany({ where: { role_id: { in: staleRoleIds } } });
    await prisma.roles.deleteMany({ where: { id: { in: staleRoleIds } } });
  }

  console.log("✅ Roles & Permissions seeded (admin, ketua, sekretaris, bendahara)");

  const pelangganSeed = [
    {
      id: "d18c8e3e-94e3-47f9-8bd5-4b07fda7d946",
      name: "Juni",
      address: "Larangan, Purbowangi",
      phone: "",
      installationBill: 900000,
      createdAt: new Date("2024-06-10T07:23:45.123Z"),
      updatedAt: new Date("2024-06-10T07:23:45.123Z"),
    },
    {
      id: "e6855f83-3152-4daf-9f23-b4915bd9ad2e",
      name: "Aris",
      address: "Larangan, Purbowangi",
      phone: "",
      installationBill: 700000,
      createdAt: new Date("2024-06-10T07:23:45.123Z"),
      updatedAt: new Date("2024-06-10T07:23:45.123Z"),
    },
    {
      id: "d849d613-0804-4ded-9e04-cf5978a28b04",
      name: "Yatin",
      address: "Larangan, Purbowangi",
      phone: "",
      installationBill: 700000,
      createdAt: new Date("2024-06-10T07:23:45.123Z"),
      updatedAt: new Date("2024-06-10T07:23:45.123Z"),
    },
    {
      id: "318a0561-f2d7-46c7-af49-3d3b47a3d773",
      name: "Tarmuji",
      address: "Larangan, Purbowangi",
      phone: "",
      installationBill: 200000,
      createdAt: new Date("2024-06-10T07:23:45.123Z"),
      updatedAt: new Date("2024-06-10T07:23:45.123Z"),
    },
    {
      id: "cc8052cc-cb92-4df7-af01-fe77d862e715",
      name: "Parmun",
      address: "Larangan, Purbowangi",
      phone: "",
      installationBill: 600000,
      createdAt: new Date("2024-06-10T07:23:45.123Z"),
      updatedAt: new Date("2024-06-10T07:23:45.123Z"),
    },
    {
      id: "8c183778-492e-4bb6-a160-bf07c6584488",
      name: "Surat",
      address: "Larangan, Purbowangi",
      phone: "",
      installationBill: 700000,
      createdAt: new Date("2024-06-10T07:23:45.123Z"),
      updatedAt: new Date("2024-06-10T07:23:45.123Z"),
    },
    {
      id: "d5904019-0932-4c38-9c19-3df56d8a2406",
      name: "Seno",
      address: "Larangan, Purbowangi",
      phone: "",
      installationBill: 250000,
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

  // Seed PamRutin with historical bills (falls back to createdAt when paymentDate is empty)
  const pamRutinSeed = [
  {
    pelangganId: "e6855f83-3152-4daf-9f23-b4915bd9ad2e", //aris
    month: 11,
    year: 2025,
    current_used: 19,
    previous_used: 18,
    water_bill: 1,
    billAmount: 4000,
    paidAmount: 4000,
    status: "paid",
    paymentDate: "2025-12-05T10:15:00Z",
    notes: "-",
    createdAt: "2025-12-01T08:00:00Z",
    updatedAt: "2025-12-05T10:20:00Z"
  },
  {
    pelangganId: "d18c8e3e-94e3-47f9-8bd5-4b07fda7d946", //juni
    month: 11,
    year: 2025,
    current_used: 183,
    previous_used: 174,
    water_bill: 9,
    billAmount: 36000,
    paidAmount: 36000,
    status: "paid",
    paymentDate: "2025-12-05T10:15:00Z",
    notes: "-",
    createdAt: "2025-12-01T08:00:00Z",
    updatedAt: "2025-12-05T10:20:00Z"
  },
  {
    pelangganId: "cc8052cc-cb92-4df7-af01-fe77d862e715", //parmun
    month: 11,
    year: 2025,
    current_used: 78,
    previous_used: 70,
    water_bill: 8,
    billAmount: 32000,
    paidAmount: 32000,
    status: "paid",
    paymentDate: "2025-12-05T10:15:00Z",
    notes: "-",
    createdAt: "2025-12-01T08:00:00Z",
    updatedAt: "2025-12-05T10:20:00Z"
  },
  {
    pelangganId: "d5904019-0932-4c38-9c19-3df56d8a2406", //seno
    month: 11,
    year: 2025,
    current_used: 19,
    previous_used: 19,
    water_bill: 0,
    billAmount: 0,
    paidAmount: 0,
    status: "paid",
    paymentDate: "2025-12-05T10:15:00Z",
    notes: "-",
    createdAt: "2025-12-01T08:00:00Z",
    updatedAt: "2025-12-05T10:20:00Z"
  },
  {
    pelangganId: "8c183778-492e-4bb6-a160-bf07c6584488", //surat
    month: 11,
    year: 2025,
    current_used: 20,
    previous_used: 19,
    water_bill: 1,
    billAmount: 4000,
    paidAmount: 4000,
    status: "paid",
    paymentDate: "2025-12-05T10:15:00Z",
    notes: "-",
    createdAt: "2025-12-01T08:00:00Z",
    updatedAt: "2025-12-05T10:20:00Z"
  },
  {
    pelangganId: "318a0561-f2d7-46c7-af49-3d3b47a3d773", //tarmuji
    month: 11,
    year: 2025,
    current_used: 104,
    previous_used: 98,
    water_bill: 6,
    billAmount: 24000,
    paidAmount: 24000,
    status: "paid",
    paymentDate: "2025-12-05T10:15:00Z",
    notes: "-",
    createdAt: "2025-12-01T08:00:00Z",
    updatedAt: "2025-12-05T10:20:00Z"
  },
  {
    pelangganId: "d849d613-0804-4ded-9e04-cf5978a28b04", //yatin
    month: 11,
    year: 2025,
    current_used: 182,
    previous_used: 172,
    water_bill: 10,
    billAmount: 40000,
    paidAmount: 0,
    status: "unpaid",
    paymentDate: "",
    notes: "-",
    createdAt: "2025-12-01T08:00:00Z",
    updatedAt: "2025-12-05T10:20:00Z"
  },
  {
    pelangganId: "e6855f83-3152-4daf-9f23-b4915bd9ad2e", //aris
    month: 12,
    year: 2025,
    current_used: 20,
    previous_used: 19,
    water_bill: 1,
    billAmount: 4000,
    paidAmount: 0,
    status: "unpaid",
    paymentDate: "",
    notes: "-",
    createdAt: "2026-01-01T08:00:00Z",
    updatedAt: "2026-01-05T10:20:00Z"
  },
  {
    pelangganId: "d18c8e3e-94e3-47f9-8bd5-4b07fda7d946", //juni
    month: 12,
    year: 2025,
    current_used: 198,
    previous_used: 183,
    water_bill: 15,
    billAmount: 60000,
    paidAmount: 0,
    status: "unpaid",
    paymentDate: "",
    notes: "-",
    createdAt: "2026-01-01T08:00:00Z",
    updatedAt: "2026-01-05T10:20:00Z"
  },
  {
    pelangganId: "cc8052cc-cb92-4df7-af01-fe77d862e715", //parmun
    month: 12,
    year: 2025,
    current_used: 90,
    previous_used: 78,
    water_bill: 12,
    billAmount: 48000,
    paidAmount: 0,
    status: "unpaid",
    paymentDate: "",
    notes: "-",
    createdAt: "2026-01-01T08:00:00Z",
    updatedAt: "2026-01-05T10:20:00Z"
  },
  {
    pelangganId: "d5904019-0932-4c38-9c19-3df56d8a2406", //seno
    month: 12,
    year: 2025,
    current_used: 19,
    previous_used: 19,
    water_bill: 0,
    billAmount: 0,
    paidAmount: 0,
    status: "paid",
    paymentDate: "2026-01-01T08:00:00Z",
    notes: "-",
    createdAt: "2026-01-01T08:00:00Z",
    updatedAt: "2026-01-05T10:20:00Z"
  },
  {
    pelangganId: "8c183778-492e-4bb6-a160-bf07c6584488", //surat
    month: 12,
    year: 2025,
    current_used: 23,
    previous_used: 20,
    water_bill: 3,
    billAmount: 12000,
    paidAmount: 0,
    status: "unpaid",
    paymentDate: "",
    notes: "-",
    createdAt: "2026-01-01T08:00:00Z",
    updatedAt: "2026-01-05T10:20:00Z"
  },
  {
    pelangganId: "318a0561-f2d7-46c7-af49-3d3b47a3d773", //tarmuji
    month: 12,
    year: 2025,
    current_used: 111,
    previous_used: 104,
    water_bill: 7,
    billAmount: 28000,
    paidAmount: 0,
    status: "unpaid",
    paymentDate: "",
    notes: "-",
    createdAt: "2026-01-01T08:00:00Z",
    updatedAt: "2026-01-05T10:20:00Z"
  },
  {
    pelangganId: "d849d613-0804-4ded-9e04-cf5978a28b04", //yatin
    month: 12,
    year: 2025,
    current_used: 195,
    previous_used: 182,
    water_bill: 13,
    billAmount: 52000,
    paidAmount: 0,
    status: "unpaid",
    paymentDate: "",
    notes: "-",
    createdAt: "2026-01-01T08:00:00Z",
    updatedAt: "2026-01-05T10:20:00Z"
  },
];

  const pamRutinCount = await prisma.pamRutin.count();
  if (pamRutinCount === 0) {
    await prisma.$transaction(
      pamRutinSeed.map((row) =>
        prisma.pamRutin.create({
          data: {
            ...row,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            paymentDate: row.paymentDate ? new Date(row.paymentDate) : null,
          },
        })
      )
    );
    console.log("✅ PamRutin seeded");
  } else {
    console.log("⚠️ PamRutin already seeded");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
