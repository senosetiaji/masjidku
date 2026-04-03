# Deploy Next.js ke Domainesia (VPS/Cloud)

Panduan ini untuk project `sistem-masjid` dengan mode single-tenant.

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
- `DATABASE_URL` (untuk SQLite bisa `file:./prisma/prod.db`)
- `DISABLE_MULTI_TENANT=true`
- `NEXT_PUBLIC_DISABLE_MULTI_TENANT=true`

## 4) Install dependency dan build

```bash
npm ci
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
npm ci
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

## Troubleshooting cepat

- App tidak jalan: cek `pm2 logs sistem-masjid`
- 502 Bad Gateway: cek port PM2 (`3010`) sama dengan `proxy_pass` Nginx
- Login gagal setelah deploy: pastikan `APP_SECRET` terisi, tidak kosong
- API error DB: cek `DATABASE_URL` valid dan file/folder bisa ditulis oleh user proses Node
