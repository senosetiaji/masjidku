import path from "path";
import { promises as fs } from "fs";
import { resolvePamRutinanUploadStorageDir } from "@/lib/helpers/pamRutinanImage";

const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const rawSegments = req.query?.segments;
    const segments = Array.isArray(rawSegments)
      ? rawSegments
      : (rawSegments ? [rawSegments] : []);

    if (segments.length === 0) {
      return res.status(404).end("Not found");
    }

    const joined = segments.join("/");
    const normalizedRelativePath = path.posix.normalize(joined);

    if (
      normalizedRelativePath.startsWith("../") ||
      normalizedRelativePath.includes("/../") ||
      normalizedRelativePath === ".."
    ) {
      return res.status(400).json({ message: "invalid_path" });
    }

    const storageRootDir = await resolvePamRutinanUploadStorageDir();
    const absoluteFilePath = path.join(storageRootDir, normalizedRelativePath);

    let fileBuffer;
    try {
      fileBuffer = await fs.readFile(absoluteFilePath);
    } catch (error) {
      if (error?.code === "ENOENT") {
        return res.status(404).end("Not found");
      }
      throw error;
    }

    const extension = path.extname(absoluteFilePath).toLowerCase();
    const mimeType = MIME_BY_EXT[extension] || "application/octet-stream";

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return res.status(200).send(fileBuffer);
  } catch (error) {
    console.error("UPLOAD FILE SERVE ERROR:", error);
    return res.status(500).json({ message: "server_error" });
  }
}
