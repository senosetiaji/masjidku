# Deploy Next.js ke Domainesia (cPanel / VPS)

Panduan ini untuk project `sistem-masjid` dengan mode single-tenant.

## Jalur A (direkomendasikan): cPanel Node.js App

Karena paket kamu sudah ada `Node.js App` + `SSH` dan Node `20.19.0`, jalur ini sudah cukup tanpa VPS.

### 1) Upload source code

Pilihan cepat lewat SSH:

```bash
cd ~
git clone <REPO_URL> sistem-masjid
cd sistem-masjid
git checkout dev-tenant
```

### 2) Siapkan environment

```bash
cp env.production.example .env.production
nano .env.production
```

Nilai minimal:
- `APP_SECRET` (wajib random panjang)
- `DATABASE_URL` (contoh SQLite: `file:./prod.db`)
- `DISABLE_MULTI_TENANT=true`
- `NEXT_PUBLIC_DISABLE_MULTI_TENANT=true`

Supaya Prisma CLI membaca env dengan konsisten, buat file `.env` dari `.env.production`:

```bash
cp .env.production .env
```

### 3) Build aplikasi

```bash
npm ci --ignore-scripts --no-audit --no-fund --omit=optional
npx prisma generate
npx prisma db push
npm run seed
npm run build
```

### 4) Setup Node.js App di cPanel

Di menu **Setup Node.js App**:
- Node version: `20.19.0`
- Application mode: `Production`
- Application root: folder project (contoh `sistem-masjid`)
- Application startup file: `node_modules/next/dist/bin/next`

Startup command (App Entry Point) set ke:

```bash
start -p $PORT
```

Jika panel meminta command terpisah, gunakan:
- Install: `npm ci`
- Startup: `npm run start -- -p $PORT`

### 5) Domain dan SSL

- Arahkan domain utama ke Node.js App dari menu cPanel.
- Aktifkan SSL (AutoSSL / Let's Encrypt di panel Domainesia).

### 6) Update deploy berikutnya

```bash
cd ~/sistem-masjid
git pull
npm ci --ignore-scripts --no-audit --no-fund --omit=optional
npx prisma generate
npx prisma db push
npm run build
```

Lalu klik **Restart App** di menu Node.js App.

### 7) Troubleshooting cepat (cPanel)

- App 500: cek log aplikasi di Node.js App / Error Log cPanel
- Build gagal: pastikan Node tetap `20.x`, lalu ulang `npm ci`
- Build gagal `Module not found` (`@prisma/client`, `bcryptjs`, `pdfkit`): biasanya install dependency belum sinkron. Jalankan dari root project:

```bash
git checkout dev-tenant
git pull
rm -rf node_modules package-lock.json .next
npm install
npx prisma generate
npm run build
```

Lalu restart app. Verifikasi cepat:

```bash
npm ls @prisma/client bcryptjs pdfkit --depth=0
```

Jika pakai cPanel Node.js App, pastikan **Application root** benar-benar ke folder project ini (bukan folder lain).
- Login gagal: cek `APP_SECRET` tidak kosong
- Error DB: cek path `DATABASE_URL` dan izin tulis file SQLite
- Seed error `P2021` (table tidak ada): ulang `cp .env.production .env`, lalu jalankan `npx prisma db push` sebelum `npm run seed`
- `npm ci` berhenti dengan `Killed`: ini biasanya OOM (RAM habis). Coba install ringan:

```bash
rm -rf node_modules
npm cache clean --force
npm ci --no-audit --no-fund --omit=optional
```

- Jika build error `Cannot find module '../lightningcss.linux-x64-gnu.node'`, pasang binary package manual lalu build ulang:

```bash
npm i --no-save lightningcss-linux-x64-gnu@1.30.2
npx next build --webpack
```

- Jika tetap `Killed`, resource paket hosting tidak cukup untuk build Next.js + Prisma; opsi paling aman upgrade resource atau pindah ke VPS.
- Jika `next build` sukses lalu `Killed` di tahap akhir, pakai mode build hemat memori (worker serial):

```bash
NODE_OPTIONS="--max-old-space-size=384" npx next build --webpack
```

Konfigurasi project ini juga sudah dibatasi ke `experimental.cpus = 1` supaya lebih stabil di shared hosting.
- `sh: next: command not found`: dependency belum terpasang tuntas (akibat `npm ci` gagal). Selesaikan install dulu, lalu cek:

```bash
npx next --version
```

- Saat test manual via SSH, jangan pakai `$PORT` jika variabel belum ada. Gunakan contoh:

```bash
npm run start -- -p 3000
```

---

## Jalur B (opsional): VPS/Cloud + PM2 + Nginx

## 1) Persiapan server

Install dependency dasar:

```bash
sudo apt update
sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Cek versi:

```bash
node -v
npm -v
pm2 -v
```

## 2) Ambil source code

```bash
sudo mkdir -p /var/www
cd /var/www
git clone <REPO_URL> sistem-masjid
cd sistem-masjid
git checkout dev-tenant
```

## 3) Siapkan environment production

```bash
cp env.production.example .env.production
nano .env.production
```

Nilai minimal yang harus diisi:
- `APP_SECRET` (wajib random panjang)
- `DATABASE_URL` (untuk SQLite: `file:./prod.db`)
- `DISABLE_MULTI_TENANT=true`
- `NEXT_PUBLIC_DISABLE_MULTI_TENANT=true`

Supaya Prisma CLI membaca env dengan konsisten, buat file `.env` dari `.env.production`:

```bash
cp .env.production .env
```

## 4) Install dependency dan build

```bash
npm ci --ignore-scripts --no-audit --no-fund --omit=optional
npx prisma generate
npx prisma db push
npm run seed
npm run build
```

## 5) Jalankan dengan PM2

Edit `cwd` di file `ecosystem.config.cjs` jika path berbeda.

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Cek status:

```bash
pm2 list
pm2 logs sistem-masjid --lines 100
```

## 6) Konfigurasi Nginx

Copy template:

```bash
sudo cp nginx/sistem-masjid.conf.example /etc/nginx/sites-available/sistem-masjid.conf
```

Edit domain:

```bash
sudo nano /etc/nginx/sites-available/sistem-masjid.conf
```

Aktifkan site dan reload:

```bash
sudo ln -s /etc/nginx/sites-available/sistem-masjid.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 7) Aktifkan HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d masjidku.com -d www.masjidku.com
```

## 8) Update deploy berikutnya

```bash
cd /var/www/sistem-masjid
git pull
npm ci --ignore-scripts --no-audit --no-fund --omit=optional
npx prisma generate
npx prisma db push
npm run build
pm2 restart sistem-masjid
```

## 9) Backup SQLite (jika pakai SQLite)

Folder penting yang harus dibackup:
- `prisma/prod.db`
- `prisma/prod.db-journal` (jika ada)

Contoh backup manual:

```bash
mkdir -p /var/backups/masjidku
cp prisma/prod.db /var/backups/masjidku/prod-$(date +%F-%H%M).db
```

## 10) Troubleshooting `Module not found` di VPS

Jika build menampilkan error seperti:
- `Can't resolve '@prisma/client'`
- `Can't resolve 'bcryptjs'`
- `Can't resolve 'pdfkit'`

Jalankan dari root project:

```bash
git checkout dev-tenant
git pull
rm -rf node_modules package-lock.json .next
npm install --ignore-scripts --no-audit --no-fund --omit=optional
npx prisma generate
npm run build
```

Lalu pastikan modul terpasang:

```bash
npm ls @prisma/client bcryptjs pdfkit --depth=0
```

Terakhir restart PM2:

```bash
pm2 restart sistem-masjid
```

## 11) Jika `npm install` / `npm ci` selalu `Killed`

Ini hampir selalu karena RAM server tidak cukup (OOM). Pakai flow hemat memori ini:

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --ignore-scripts --no-audit --no-fund --omit=optional --prefer-offline
npx prisma generate
```

Lalu lanjut:

```bash
npx prisma db push
npm run build
```

Jika masih `Killed`:
- cPanel/shared hosting: tingkatkan resource paket hosting (RAM/CPU) atau pindah ke VPS.
- VPS Ubuntu: tambah swap sementara (contoh 2GB), lalu ulang install.

Contoh tambah swap (VPS):

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
free -h
```

## Troubleshooting cepat

- App tidak jalan: cek `pm2 logs sistem-masjid`
- 502 Bad Gateway: cek port PM2 (`3010`) sama dengan `proxy_pass` Nginx
- Login gagal setelah deploy: pastikan `APP_SECRET` terisi, tidak kosong
- API error DB: cek `DATABASE_URL` valid dan file/folder bisa ditulis oleh user proses Node
- Seed error `P2021` (table tidak ada): ulang `cp .env.production .env`, lalu jalankan `npx prisma db push` sebelum `npm run seed`
