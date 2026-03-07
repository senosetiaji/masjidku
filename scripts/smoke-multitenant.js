const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3010";

const TENANT_A_HOST = process.env.SMOKE_TENANT_A_HOST || "";
const TENANT_A_USERNAME = process.env.SMOKE_TENANT_A_USERNAME || "";
const TENANT_A_PASSWORD = process.env.SMOKE_TENANT_A_PASSWORD || "";

const TENANT_B_HOST = process.env.SMOKE_TENANT_B_HOST || "";
const TENANT_B_USERNAME = process.env.SMOKE_TENANT_B_USERNAME || "";
const TENANT_B_PASSWORD = process.env.SMOKE_TENANT_B_PASSWORD || "";

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`missing_env:${name}`);
  }
}

async function readJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (_) {
    return { raw: text };
  }
}

function firstSessionCookie(setCookieHeader) {
  if (!setCookieHeader) return null;

  if (Array.isArray(setCookieHeader)) {
    const pair = setCookieHeader.find((item) => item.startsWith("session="));
    return pair ? pair.split(";")[0] : null;
  }

  const parts = String(setCookieHeader)
    .split(",")
    .map((x) => x.trim());

  const pair = parts.find((item) => item.startsWith("session="));
  return pair ? pair.split(";")[0] : null;
}

async function requestApi(path, { method = "GET", host, cookie, body } = {}) {
  const headers = {
    "X-Forwarded-Host": host,
  };

  if (cookie) headers.Cookie = cookie;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await readJson(res);
  return { res, json };
}

function assertCheck(name, condition, detail, failures) {
  if (!condition) failures.push({ name, detail });
}

async function login(host, username, password) {
  const { res, json } = await requestApi("/api/masjidku/auth/login", {
    method: "POST",
    host,
    body: { username, password },
  });

  const setCookie = res.headers.get("set-cookie");
  const sessionCookie = firstSessionCookie(setCookie);

  return { status: res.status, json, sessionCookie };
}

async function run() {
  requireEnv("SMOKE_TENANT_A_HOST", TENANT_A_HOST);
  requireEnv("SMOKE_TENANT_A_USERNAME", TENANT_A_USERNAME);
  requireEnv("SMOKE_TENANT_A_PASSWORD", TENANT_A_PASSWORD);

  const hasTenantB = Boolean(TENANT_B_HOST && TENANT_B_USERNAME && TENANT_B_PASSWORD);

  const failures = [];

  const loginA = await login(TENANT_A_HOST, TENANT_A_USERNAME, TENANT_A_PASSWORD);
  assertCheck("login_a_status", loginA.status === 200, loginA, failures);
  assertCheck("login_a_cookie", Boolean(loginA.sessionCookie), loginA, failures);

  let loginB = null;
  if (hasTenantB) {
    loginB = await login(TENANT_B_HOST, TENANT_B_USERNAME, TENANT_B_PASSWORD);
    assertCheck("login_b_status", loginB.status === 200, loginB, failures);
    assertCheck("login_b_cookie", Boolean(loginB.sessionCookie), loginB, failures);
  }

  if (loginA.sessionCookie) {
    const currentA = await requestApi("/api/masjidku/user/currentUser", {
      host: TENANT_A_HOST,
      cookie: loginA.sessionCookie,
    });
    assertCheck("current_user_a_ok", currentA.res.status === 200, currentA, failures);

    if (hasTenantB) {
      const currentAB = await requestApi("/api/masjidku/user/currentUser", {
        host: TENANT_B_HOST,
        cookie: loginA.sessionCookie,
      });
      assertCheck("current_user_a_on_b_forbidden", currentAB.res.status === 403, currentAB, failures);

      const financeAB = await requestApi("/api/masjidku/finance/all?page=1&limit=1", {
        host: TENANT_B_HOST,
        cookie: loginA.sessionCookie,
      });
      assertCheck("finance_a_on_b_forbidden", financeAB.res.status === 403, financeAB, failures);
    }
  }

  if (hasTenantB && loginB?.sessionCookie) {
    const currentB = await requestApi("/api/masjidku/user/currentUser", {
      host: TENANT_B_HOST,
      cookie: loginB.sessionCookie,
    });
    assertCheck("current_user_b_ok", currentB.res.status === 200, currentB, failures);

    const currentBA = await requestApi("/api/masjidku/user/currentUser", {
      host: TENANT_A_HOST,
      cookie: loginB.sessionCookie,
    });
    assertCheck("current_user_b_on_a_forbidden", currentBA.res.status === 403, currentBA, failures);
  }

  if (failures.length > 0) {
    console.error("❌ Multi-tenant smoke test gagal");
    for (const failure of failures) {
      console.error(`- ${failure.name}`, failure.detail);
    }
    process.exit(1);
  }

  console.log("✅ Multi-tenant smoke test lulus");
}

run().catch((error) => {
  console.error("❌ Multi-tenant smoke test error", error);
  process.exit(1);
});
