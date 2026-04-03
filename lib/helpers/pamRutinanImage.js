import path from "path";
import crypto from "crypto";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidateStorageDirs = () => {
  const inferredProjectRoot = path.resolve(__dirname, "..", "..");
  const fromEnvRoot = process.env.APP_ROOT_PATH
    ? path.join(process.env.APP_ROOT_PATH, "storage", "uploads")
    : null;
  const fromEnvStorage = process.env.UPLOAD_STORAGE_DIR || null;

  return [
    fromEnvStorage,
    fromEnvRoot,
    path.join(process.cwd(), "storage", "uploads"),
    path.join(inferredProjectRoot, "storage", "uploads"),
  ].filter(Boolean);
};

export const resolvePamRutinanUploadStorageDir = async () => {
  const candidates = candidateStorageDirs();

  for (const candidate of candidates) {
    try {
      await fs.mkdir(candidate, { recursive: true });
      return candidate;
    } catch (error) {
    }
  }

  const fallback = candidates[0] || path.join(process.cwd(), "storage", "uploads");
  await fs.mkdir(fallback, { recursive: true });
  return fallback;
};

const sanitizeTenantKey = (tenantKey = "default") =>
  String(tenantKey || "default")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "default";

const parseDataUrl = (dataUrl = "") => {
  const value = String(dataUrl || "");
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return null;
  }

  const mimeType = String(match[1] || "").toLowerCase();
  const extension = ALLOWED_IMAGE_TYPES[mimeType];
  if (!extension) {
    return null;
  }

  const base64Payload = match[2] || "";
  const buffer = Buffer.from(base64Payload, "base64");
  if (!buffer || buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
    return null;
  }

  return {
    mimeType,
    extension,
    buffer,
  };
};

export const savePamRutinanPhotoFromDataUrl = async ({ dataUrl, tenantKey = "default" }) => {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    throw new Error("invalid_photo_data_url");
  }

  const safeTenant = sanitizeTenantKey(tenantKey);
  const storageRootDir = await resolvePamRutinanUploadStorageDir();
  const uploadsRelativeDir = path.join("pam-rutinan", safeTenant);
  const uploadsAbsDir = path.join(storageRootDir, uploadsRelativeDir);

  await fs.mkdir(uploadsAbsDir, { recursive: true });

  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${parsed.extension}`;
  const fileAbsPath = path.join(uploadsAbsDir, filename);

  await fs.writeFile(fileAbsPath, parsed.buffer);

  const publicUrl = `/uploads/${uploadsRelativeDir.replace(/\\/g, "/")}/${filename}`;
  return publicUrl;
};

export const deletePamRutinanPhotoIfExists = async (publicUrl) => {
  const normalized = String(publicUrl || "").trim();
  if (!normalized.startsWith("/uploads/pam-rutinan/")) {
    return;
  }

  const relativeFilePath = normalized.replace(/^\/uploads\//, "");
  if (relativeFilePath.includes("..")) {
    return;
  }

  const storageRootDir = await resolvePamRutinanUploadStorageDir();
  const absoluteFilePath = path.join(storageRootDir, relativeFilePath);

  try {
    await fs.unlink(absoluteFilePath);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
};
