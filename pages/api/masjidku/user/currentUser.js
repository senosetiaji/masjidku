import crypto from "crypto";

const SECRET = process.env.APP_SECRET || "dev-secret";

const getToken = (req) => {
	if (req.headers.authorization?.startsWith("Bearer ")) {
		return req.headers.authorization.slice(7);
	}
	return req.cookies?.session || null;
};

const verifyToken = (token) => {
	try {
		const [payload, signature] = token.split(".");
		if (!payload || !signature) return null;

		const expectedSig = crypto
			.createHmac("sha256", SECRET)
			.update(payload)
			.digest("hex");

		// timing safe compare
		const sigBuf = Buffer.from(signature, "hex");
		const expBuf = Buffer.from(expectedSig, "hex");
		if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
			return null;
		}

		const json = Buffer.from(payload, "base64url").toString("utf8");
		return JSON.parse(json);
	} catch (err) {
		return null;
	}
};

export default function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const token = getToken(req);
	if (!token) {
    const meta = { message: "unauthorized", status: 401 };
		return res.status(401).json({...meta});
	}

	const user = verifyToken(token);
	if (!user) {
    const meta = { message: "unauthorized", status: 401 };
		return res.status(401).json({...meta});
	}

	// Do not expose sensitive fields like password
	const safeUser = {
		id: user.id,
		name: user.name,
		role: user.role,
		username: user.username,
	};

	return res.status(200).json({ status: 200, message: "OK", data: safeUser });
}
