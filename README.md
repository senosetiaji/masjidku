This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

## Multi-tenant (subdomain)

Project ini mendukung fondasi multi-tenant berbasis subdomain.

- Tenant di-resolve dari host request (contoh `alkhusna.masjidku.com` -> tenant `alkhusna`).
- Session login menyimpan tenant di token, dan API akan menolak akses jika tenant token tidak cocok dengan host.
- Prisma bisa diarahkan ke database tenant masing-masing melalui `TENANT_DATABASE_TEMPLATE` (lihat `env.example`).

Contoh local sqlite:

```env
TENANT_DATABASE_TEMPLATE="file:./prisma/tenants/{tenant}.db"
DEFAULT_TENANT_KEY="default"
```

## Smoke test multi-tenant

Siapkan user admin tenant otomatis (opsional tapi disarankan):

```bash
npm run seed:tenant-users
```

Untuk verifikasi cepat bahwa session tenant A tidak bisa dipakai di tenant B, jalankan:

```bash
npm run smoke:tenant
```

Environment variable yang diperlukan:

```env
SMOKE_BASE_URL="http://localhost:3010"
SMOKE_TENANT_A_HOST="alkhusna.masjidku.com"
SMOKE_TENANT_A_USERNAME="admin_a"
SMOKE_TENANT_A_PASSWORD="password_a"
SMOKE_TENANT_B_HOST="alhuda.masjidku.com"
SMOKE_TENANT_B_USERNAME="admin_b"
SMOKE_TENANT_B_PASSWORD="password_b"
```

Opsional untuk seed tenant manual via CSV:

```env
MULTITENANT_SEED_KEYS="alkhusna,alhuda"
MULTITENANT_SEED_PASSWORD="admin123"
```
