/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  sassOptions: {
    additionalData: `$var: red;`,
  },
};

export default nextConfig;
