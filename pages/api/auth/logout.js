// Simple logout handler: clears session cookie and returns success
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const isProd = process.env.NODE_ENV === "production";
  const cookie = `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProd ? "; Secure" : ""}`;
  res.setHeader("Set-Cookie", cookie);

  return res.status(200).json({ status: 200, message: "Logout berhasil", data: null });
}
