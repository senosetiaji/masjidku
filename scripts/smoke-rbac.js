const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3010";
const SECRET = process.env.APP_SECRET || "dev-secret";

function signToken(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(encoded).digest("hex");
  return `${encoded}.${signature}`;
}

async function readJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (_) {
    return { raw: text };
  }
}

function assertCheck(name, condition, detail, failures) {
  if (!condition) {
    failures.push({ name, detail });
  }
}

async function runInventarisChecks(sessionCookie, ownerId, suffix, failures) {
  let createdId = null;

  try {
    const created = await prisma.inventaris.create({
      data: {
        name: `SMOKE-INV-${suffix}`,
        quantity: 1,
        condition: "baik",
        description: "smoke-check",
        userId: ownerId,
      },
      select: { id: true },
    });

    createdId = created.id;

    const listRes = await fetch(`${BASE_URL}/api/masjidku/inventaris/all?search=SMOKE-INV-${suffix}&page=1&limit=10`, {
      headers: { Cookie: sessionCookie },
    });
    const listJson = await readJson(listRes);

    const detailRes = await fetch(`${BASE_URL}/api/masjidku/inventaris/${createdId}/detail`, {
      headers: { Cookie: sessionCookie },
    });

    const updateRes = await fetch(`${BASE_URL}/api/masjidku/inventaris/${createdId}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify([
        {
          name: `SMOKE-INV-${suffix}-UPDATED`,
          quantity: 2,
          condition: "baik",
          description: "smoke-updated",
        },
      ]),
    });

    const deleteRes = await fetch(`${BASE_URL}/api/masjidku/inventaris/${createdId}/delete`, {
      method: "DELETE",
      headers: { Cookie: sessionCookie },
    });

    const deleted = await prisma.inventaris.findUnique({ where: { id: createdId }, select: { id: true } });

    assertCheck("inventaris:list_status", listRes.status === 200, { status: listRes.status, body: listJson }, failures);
    assertCheck(
      "inventaris:list_contains_record",
      Array.isArray(listJson?.data) && listJson.data.some((x) => x.id === createdId),
      { createdId, body: listJson },
      failures
    );
    assertCheck("inventaris:detail_status", detailRes.status === 200, { status: detailRes.status }, failures);
    assertCheck("inventaris:update_status", updateRes.status === 200, { status: updateRes.status }, failures);
    assertCheck("inventaris:delete_status", deleteRes.status === 200, { status: deleteRes.status }, failures);
    assertCheck("inventaris:deleted_from_db", !deleted, { createdId }, failures);

    createdId = null;
  } finally {
    if (createdId) {
      await prisma.inventaris.delete({ where: { id: createdId } }).catch(() => {});
    }
  }
}

async function runKeuanganChecks(sessionCookie, ownerId, suffix, failures) {
  let createdId = null;

  try {
    const created = await prisma.keuangan.create({
      data: {
        date: new Date(),
        type: "income",
        amount: 100001,
        description: `SMOKE-FIN-${suffix}`,
        userId: ownerId,
      },
      select: { id: true },
    });

    createdId = created.id;

    const listRes = await fetch(`${BASE_URL}/api/masjidku/finance/all?search=SMOKE-FIN-${suffix}&page=1&limit=10`, {
      headers: { Cookie: sessionCookie },
    });
    const listJson = await readJson(listRes);

    const detailRes = await fetch(`${BASE_URL}/api/masjidku/finance/${createdId}/detail`, {
      headers: { Cookie: sessionCookie },
    });

    const updateRes = await fetch(`${BASE_URL}/api/masjidku/finance/${createdId}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({
        description: `SMOKE-FIN-${suffix}-UPDATED`,
        amount: 100002,
        type: "income",
        date: new Date().toISOString(),
      }),
    });

    const exportRes = await fetch(`${BASE_URL}/api/masjidku/finance/export?search=SMOKE-FIN-${suffix}-UPDATED`, {
      headers: { Cookie: sessionCookie },
    });

    const deleteRes = await fetch(`${BASE_URL}/api/masjidku/finance/${createdId}/delete`, {
      method: "DELETE",
      headers: { Cookie: sessionCookie },
    });

    const deleted = await prisma.keuangan.findUnique({ where: { id: createdId }, select: { id: true } });

    assertCheck("keuangan:list_status", listRes.status === 200, { status: listRes.status, body: listJson }, failures);
    assertCheck(
      "keuangan:list_contains_record",
      Array.isArray(listJson?.data) && listJson.data.some((x) => x.id === createdId),
      { createdId, body: listJson },
      failures
    );
    assertCheck("keuangan:detail_status", detailRes.status === 200, { status: detailRes.status }, failures);
    assertCheck("keuangan:update_status", updateRes.status === 200, { status: updateRes.status }, failures);
    assertCheck(
      "keuangan:export_pdf",
      exportRes.status === 200 && (exportRes.headers.get("content-type") || "").includes("application/pdf"),
      { status: exportRes.status, contentType: exportRes.headers.get("content-type") },
      failures
    );
    assertCheck("keuangan:delete_status", deleteRes.status === 200, { status: deleteRes.status }, failures);
    assertCheck("keuangan:deleted_from_db", !deleted, { createdId }, failures);

    createdId = null;
  } finally {
    if (createdId) {
      await prisma.keuangan.delete({ where: { id: createdId } }).catch(() => {});
    }
  }
}

async function runPamChecks(sessionCookie, ownerId, suffix, failures) {
  let createdId = null;

  try {
    const created = await prisma.pamKas.create({
      data: {
        date: new Date(),
        type: "income",
        amount: 200001,
        description: `SMOKE-PAM-${suffix}`,
        userId: ownerId,
      },
      select: { id: true },
    });

    createdId = created.id;

    const listRes = await fetch(`${BASE_URL}/api/masjidku/pam/finance/all?search=SMOKE-PAM-${suffix}&page=1&limit=10`, {
      headers: { Cookie: sessionCookie },
    });
    const listJson = await readJson(listRes);

    const detailRes = await fetch(`${BASE_URL}/api/masjidku/pam/finance/${createdId}/detail`, {
      headers: { Cookie: sessionCookie },
    });

    const updateRes = await fetch(`${BASE_URL}/api/masjidku/pam/finance/${createdId}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({
        description: `SMOKE-PAM-${suffix}-UPDATED`,
        amount: 200002,
        type: "income",
        date: new Date().toISOString(),
      }),
    });

    const exportRes = await fetch(`${BASE_URL}/api/masjidku/pam/finance/export?search=SMOKE-PAM-${suffix}-UPDATED`, {
      headers: { Cookie: sessionCookie },
    });

    const deleteRes = await fetch(`${BASE_URL}/api/masjidku/pam/finance/${createdId}/delete`, {
      method: "DELETE",
      headers: { Cookie: sessionCookie },
    });

    const deleted = await prisma.pamKas.findUnique({ where: { id: createdId }, select: { id: true } });

    assertCheck("pam:list_status", listRes.status === 200, { status: listRes.status, body: listJson }, failures);
    assertCheck(
      "pam:list_contains_record",
      Array.isArray(listJson?.data) && listJson.data.some((x) => x.id === createdId),
      { createdId, body: listJson },
      failures
    );
    assertCheck("pam:detail_status", detailRes.status === 200, { status: detailRes.status }, failures);
    assertCheck("pam:update_status", updateRes.status === 200, { status: updateRes.status }, failures);
    assertCheck(
      "pam:export_pdf",
      exportRes.status === 200 && (exportRes.headers.get("content-type") || "").includes("application/pdf"),
      { status: exportRes.status, contentType: exportRes.headers.get("content-type") },
      failures
    );
    assertCheck("pam:delete_status", deleteRes.status === 200, { status: deleteRes.status }, failures);
    assertCheck("pam:deleted_from_db", !deleted, { createdId }, failures);

    createdId = null;
  } finally {
    if (createdId) {
      await prisma.pamKas.delete({ where: { id: createdId } }).catch(() => {});
    }
  }
}

async function main() {
  const failures = [];

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, username: true, role: true, jabatan: true },
      orderBy: { id: "asc" },
    });

    if (users.length < 2) {
      throw new Error("Need at least 2 users in database for cross-owner smoke test");
    }

    const ketua =
      users.find((u) => (u.jabatan || "").toLowerCase().includes("ketua")) ||
      users.find((u) => (u.username || "").toLowerCase().includes("ketua")) ||
      users[0];

    const owner = users.find((u) => u.id !== ketua.id);
    if (!owner) {
      throw new Error("Could not find secondary owner user");
    }

    const token = signToken({
      id: ketua.id,
      name: ketua.name,
      role: ketua.role,
      username: ketua.username,
    });

    const sessionCookie = `session=${token}`;
    const suffix = Date.now();

    const ping = await fetch(`${BASE_URL}/api/hello`);
    assertCheck("server:reachable", ping.status === 200, { status: ping.status }, failures);

    await runInventarisChecks(sessionCookie, owner.id, suffix, failures);
    await runKeuanganChecks(sessionCookie, owner.id, suffix, failures);
    await runPamChecks(sessionCookie, owner.id, suffix, failures);

    if (failures.length > 0) {
      console.error("RBAC smoke test FAILED");
      console.error(JSON.stringify({
        baseUrl: BASE_URL,
        actor: { id: ketua.id, username: ketua.username, jabatan: ketua.jabatan },
        owner: { id: owner.id, username: owner.username, jabatan: owner.jabatan },
        failures,
      }, null, 2));
      process.exitCode = 1;
      return;
    }

    console.log("RBAC smoke test PASSED");
    console.log(JSON.stringify({
      baseUrl: BASE_URL,
      actor: { id: ketua.id, username: ketua.username, jabatan: ketua.jabatan },
      owner: { id: owner.id, username: owner.username, jabatan: owner.jabatan },
      checked: [
        "inventaris:list/detail/update/delete",
        "keuangan:list/detail/update/export/delete",
        "pam-finance:list/detail/update/export/delete",
      ],
    }, null, 2));
  } catch (error) {
    console.error("RBAC smoke test ERROR");
    console.error(error.message || error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
