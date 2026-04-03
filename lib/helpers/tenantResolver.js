const RESERVED_SUBDOMAINS = new Set(["www", "api", "localhost"]);

const FALLBACK_TENANT = process.env.DEFAULT_TENANT_KEY || "default";
const SINGLE_TENANT_MODE = (process.env.DISABLE_MULTI_TENANT || "").toLowerCase() === "true";

const parseAliasMap = () => {
  const raw = process.env.TENANT_SLUG_ALIASES || "";
  if (!raw.trim()) return {};

  return raw.split(",").reduce((acc, pair) => {
    const [from, to] = pair.split(":").map((v) => (v || "").trim().toLowerCase());
    if (from && to) acc[from] = to;
    return acc;
  }, {});
};

const ALIAS_MAP = parseAliasMap();

const normalizeHost = (rawHost = "") => {
  if (!rawHost) return "";
  return rawHost.toString().trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
};

const isIpHost = (host) => /^(\d{1,3}\.){3}\d{1,3}$/.test(host);

const mapTenantAlias = (slug) => ALIAS_MAP[slug] || slug;

export const resolveTenantFromRequest = (req) => {
  const forwardedHost = req?.headers?.["x-forwarded-host"];
  const host = normalizeHost(Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || req?.headers?.host || "");

  if (SINGLE_TENANT_MODE) {
    return {
      host,
      slug: FALLBACK_TENANT,
      tenantKey: FALLBACK_TENANT,
      isFallback: true,
      reason: "single_tenant_mode",
    };
  }

  if (!host || host === "localhost" || isIpHost(host)) {
    return {
      host,
      slug: FALLBACK_TENANT,
      tenantKey: FALLBACK_TENANT,
      isFallback: true,
      reason: "host_unresolved",
    };
  }

  const parts = host.split(".").filter(Boolean);
  const candidate = parts.length >= 3 ? parts[0] : null;

  if (!candidate || RESERVED_SUBDOMAINS.has(candidate)) {
    return {
      host,
      slug: FALLBACK_TENANT,
      tenantKey: FALLBACK_TENANT,
      isFallback: true,
      reason: "subdomain_unavailable",
    };
  }

  const tenantKey = mapTenantAlias(candidate);
  return {
    host,
    slug: candidate,
    tenantKey,
    isFallback: false,
    reason: "subdomain",
  };
};
