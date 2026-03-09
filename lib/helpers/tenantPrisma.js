import { PrismaClient } from "@prisma/client";
import { resolveTenantFromRequest } from "./tenantResolver";

const globalForTenantPrisma = globalThis;

if (!globalForTenantPrisma.__tenantPrismaClients) {
  globalForTenantPrisma.__tenantPrismaClients = new Map();
}

if (typeof globalForTenantPrisma.__tenantPrismaWarned === "undefined") {
  globalForTenantPrisma.__tenantPrismaWarned = false;
}

const prismaClientCache = globalForTenantPrisma.__tenantPrismaClients;

const SQLITE_FALLBACK_TEMPLATE = process.env.SQLITE_TENANT_TEMPLATE || "file:./tenants/{tenant}.db";

const isSqliteFileUrl = (url) => typeof url === "string" && url.startsWith("file:");

const buildTenantDatabaseUrl = (tenantKey) => {
  const explicitTenantTemplate = process.env.TENANT_DATABASE_TEMPLATE;

  if (explicitTenantTemplate) {
    if (explicitTenantTemplate.includes("{tenant}")) {
      return explicitTenantTemplate.replaceAll("{tenant}", tenantKey);
    }

    return explicitTenantTemplate;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (isSqliteFileUrl(databaseUrl)) {
    return databaseUrl;
  }

  if (!databaseUrl && !SQLITE_FALLBACK_TEMPLATE) {
    throw new Error("DATABASE_URL_or_TENANT_DATABASE_TEMPLATE_required");
  }

  if (!globalForTenantPrisma.__tenantPrismaWarned) {
    console.warn(
      "[tenantPrisma] Non-sqlite DATABASE_URL detected while SQLite provider is active. Falling back to SQLITE_TENANT_TEMPLATE/file-based tenant DB."
    );
    globalForTenantPrisma.__tenantPrismaWarned = true;
  }

  if (SQLITE_FALLBACK_TEMPLATE.includes("{tenant}")) {
    return SQLITE_FALLBACK_TEMPLATE.replaceAll("{tenant}", tenantKey);
  }

  return SQLITE_FALLBACK_TEMPLATE;
};

export const getTenantPrisma = (reqOrTenantKey) => {
  const tenant = typeof reqOrTenantKey === "string"
    ? { tenantKey: reqOrTenantKey }
    : resolveTenantFromRequest(reqOrTenantKey);

  const tenantKey = tenant.tenantKey || "default";
  const dbUrl = buildTenantDatabaseUrl(tenantKey);
  const cacheKey = `${tenantKey}:${dbUrl}`;

  if (!prismaClientCache.has(cacheKey)) {
    const client = new PrismaClient({
      datasources: {
        db: { url: dbUrl },
      },
    });

    prismaClientCache.set(cacheKey, client);
  }

  return {
    prisma: prismaClientCache.get(cacheKey),
    tenant: {
      tenantKey,
      ...(typeof reqOrTenantKey === "string" ? {} : tenant),
      dbUrl,
    },
  };
};
