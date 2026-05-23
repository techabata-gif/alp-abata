# Platform Penggalangan Dana

MVP platform donasi dan penggalangan dana berbasis Next.js, Prisma, dan PostgreSQL. Payment gateway sengaja belum diaktifkan; dana masuk dicatat manual melalui admin dan tersimpan ke database.

## Fitur MVP

- Landing page dengan progress campaign dan donasi terbaru.
- Campaign umum, tidak terbatas untuk qurban.
- Detail campaign dengan progress polling berkala.
- Form donasi publik dengan status awal `PENDING`.
- Admin dashboard untuk membuat campaign, input donasi manual, dan verifikasi donasi.
- API route untuk campaign dan donasi.
- Prisma schema PostgreSQL dan seed data.

## Menjalankan Lokal

1. Salin `.env.example` menjadi `.env`.
2. Isi `DATABASE_URL` PostgreSQL.
3. Jalankan instalasi dependency.
4. Sinkronkan schema dan isi data awal:

```bash
npm run db:push
npm run db:seed
```

5. Jalankan app:

```bash
npm run dev
```

## Deployment Railway

- Build command: `npm run build`
- Start command: `npm start`
- Tambahkan service PostgreSQL di Railway dan set `DATABASE_URL`.

## Catatan Produksi

Admin route pada MVP ini belum diberi autentikasi. Sebelum publik production, aktifkan Auth.js/NextAuth, RBAC admin, rate limit, audit log, dan proteksi webhook jika payment gateway mulai digunakan.
