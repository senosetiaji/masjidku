import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma;
if (!prisma) {
	prisma = new PrismaClient();
	if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

const SECRET = process.env.APP_SECRET || "dev-secret";

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

const parseDate = (val) => {
	if (!val) return null;
	const d = new Date(val);
	return Number.isNaN(d.getTime()) ? null : d;
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

		const { date: rawDate, topic: rawTopic, notes: rawNotes, summary: rawSummary } = req.body || {};
		const topic = typeof rawTopic === "string" ? rawTopic.trim() : "";
		if (!topic) {
			return res.status(400).json({ message: "invalid_topic" });
		}

		const date = parseDate(rawDate);
		if (!date) {
			return res.status(400).json({ message: "invalid_date" });
		}

		const notes = typeof rawNotes === "string" ? rawNotes : "";
		const summary = typeof rawSummary === "string" ? rawSummary.trim() : "";

		const duplicateTopic = await prisma.musyawarah.findFirst({
			where: { topic: { equals: topic } },
			select: { id: true },
		});
		if (duplicateTopic) {
			return res.status(400).json({ message: "topic_already_exist" });
		}

		const created = await prisma.musyawarah.create({
			data: {
				date,
				topic,
				notes,
				summary,
			},
		});

		return res.status(200).json({
			status: 200,
			message: "musyawarah_created",
			data: {
				id: created.id,
				date: created.date.toISOString(),
				topic: created.topic,
				notes: created.notes,
				summary: created.summary,
				createdAt: created.createdAt.toISOString(),
				updatedAt: created.updatedAt.toISOString(),
			},
		});
	} catch (error) {
		console.error("CREATE MUSYAWARAH ERROR:", error);
		return res.status(500).json({ message: "server_error" });
	}
}
