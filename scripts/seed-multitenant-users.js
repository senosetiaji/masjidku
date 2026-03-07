const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const { execSync } = require("child_process");

const TENANT_TEMPLATE = process.env.TENANT_DATABASE_TEMPLATE || "";
const DEFAULT_PASSWORD = process.env.MULTITENANT_SEED_PASSWORD || "admin123";

const USER_A = process.env.SMOKE_TENANT_A_USERNAME || process.env.MULTITENANT_SEED_USER_A || "admin";
const PASS_A = process.env.SMOKE_TENANT_A_PASSWORD || process.env.MULTITENANT_SEED_PASS_A || DEFAULT_PASSWORD;

const USER_B = process.env.SMOKE_TENANT_B_USERNAME || process.env.MULTITENANT_SEED_USER_B || "admin";
const PASS_B = process.env.SMOKE_TENANT_B_PASSWORD || process.env.MULTITENANT_SEED_PASS_B || DEFAULT_PASSWORD;

const normalizeHost = (rawHost = "") =>
  String(rawHost).trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0].split(":")[0];

const parseTenantFromHost = (host) => {
  const normalized = normalizeHost(host);
  if (!normalized) return null;
  const parts = normalized.split(".").filter(Boolean);
  if (parts.length >= 3) return parts[0];
  return null;
};

const parseTenantList = () => {
  const csv = (process.env.MULTITENANT_SEED_KEYS || "").trim();
  if (csv) {
    return csv
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  const fromA = parseTenantFromHost(process.env.SMOKE_TENANT_A_HOST);
  const fromB = parseTenantFromHost(process.env.SMOKE_TENANT_B_HOST);
  return [fromA, fromB].filter(Boolean);
};

const unique = (arr) => Array.from(new Set(arr));

const buildDbUrl = (tenantKey) => {
  if (!TENANT_TEMPLATE || !TENANT_TEMPLATE.includes("{tenant}")) {
    throw new Error("TENANT_DATABASE_TEMPLATE_must_include_{tenant}");
  }
  return TENANT_TEMPLATE.replaceAll("{tenant}", tenantKey);
};

const pushSchema = (databaseUrl) => {
  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  });
};

const upsertTenantAdmin = async ({ tenantKey, databaseUrl, username, password }) => {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
  });

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
      where: { username },
      update: {
        name: `Admin ${tenantKey}`,
        password: passwordHash,
        role: "superadmin",
      },
      create: {
        id: randomUUID(),
        name: `Admin ${tenantKey}`,
        phone: "",
        jabatan: "Administrator",
        username,
        password: passwordHash,
        role: "superadmin",
      },
    });

    console.log(`✅ Tenant ${tenantKey}: user ${username} siap`);
  } finally {
    await prisma.$disconnect();
  }
};

async function main() {
  const tenants = unique(parseTenantList());

  if (tenants.length === 0) {
    throw new Error("no_tenants_found_set_MULTITENANT_SEED_KEYS_or_SMOKE_TENANT_A/B_HOST");
  }

  const tenantAKey = parseTenantFromHost(process.env.SMOKE_TENANT_A_HOST);
  const tenantBKey = parseTenantFromHost(process.env.SMOKE_TENANT_B_HOST);

  for (const tenantKey of tenants) {
    const databaseUrl = buildDbUrl(tenantKey);
    console.log(`\n🔧 Preparing schema for tenant ${tenantKey} (${databaseUrl})`);
    pushSchema(databaseUrl);

    let username = USER_A;
    let password = PASS_A;

    if (tenantBKey && tenantKey === tenantBKey) {
      username = USER_B;
      password = PASS_B;
    } else if (tenantAKey && tenantKey === tenantAKey) {
      username = USER_A;
      password = PASS_A;
    }

    await upsertTenantAdmin({ tenantKey, databaseUrl, username, password });
  }

  console.log("\n🎉 Multi-tenant user seed selesai");
}

main().catch((error) => {
  console.error("❌ Multi-tenant user seed gagal", error.message || error);
  process.exit(1);
});
