/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    cpus: 1,
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: "/uploads/:path*",
          destination: "/api/uploads/:path*",
        },
      ],
    };
  },
  sassOptions: {
    additionalData: `$var: red;`,
  },
};

export default nextConfig;
