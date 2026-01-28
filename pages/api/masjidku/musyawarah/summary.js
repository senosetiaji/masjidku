import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;
if (!prisma) {
  prisma = new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

const SECRET = process.env.APP_SECRET || "dev-secret";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_SUMMARY_MODEL = process.env.OPENAI_SUMMARY_MODEL || "gpt-4o-mini";

const verifyToken = (token) => {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(encoded).digest("hex");
  if (expected !== signature) return null;
  const json = Buffer.from(encoded, "base64url").toString("utf8");
  try {
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
};

const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const cookieHeader = req.headers.cookie || "";
    const sessionCookie = cookieHeader.split(";").find((c) => c.trim().startsWith("session="));
    const token = sessionCookie ? sessionCookie.trim().replace("session=", "") : null;
    const session = verifyToken(token);
    if (!session?.id) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: String(session.id) },
      select: { id: true },
    });
    if (!userExists) {
      return res.status(401).json({ message: "invalid_session_user" });
    }

    const { notes } = req.body || {};
    const cleanedNotes = stripHtml(notes);
    if (!cleanedNotes) {
      return res.status(400).json({ message: "invalid_notes" });
    }

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ message: "missing_openai_key" });
    }

    const prompt = `Ringkas hasil musyawarah berikut dalam 2-3 kalimat berbahasa Indonesia dengan nada profesional dan fokus pada keputusan utama, tindak lanjut, serta pihak yang bertanggung jawab.\n\n${cleanedNotes}`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_SUMMARY_MODEL,
        temperature: 0.2,
        max_tokens: 200,
        messages: [
          {
            role: "system",
            content:
              "Anda adalah asisten yang merangkum hasil musyawarah internal masjid secara ringkas, jelas, dan actionable.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const aiJson = await aiResponse.json();
    if (!aiResponse.ok) {
      console.error("OPENAI SUMMARY ERROR:", aiJson);
      return res.status(502).json({ message: "ai_summary_failed" });
    }

    const summary = aiJson?.choices?.[0]?.message?.content?.trim();
    if (!summary) {
      return res.status(502).json({ message: "ai_summary_empty" });
    }

    return res.status(200).json({
      status: 200,
      message: "musyawarah_summary_generated",
      data: { summary },
    });
  } catch (error) {
    console.error("MUSYAWARAH SUMMARY ERROR:", error);
    return res.status(500).json({ message: "server_error" });
  }
}
