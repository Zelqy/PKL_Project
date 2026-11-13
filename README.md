# Pasar Janapria

MVP marketplace UMKM & jasa Desa Janapria (Lombok Tengah): PWA offline-first, tampilan marketplace modern full-screen, bilingual Indonesia/Sasak, katalog terkurasi, jasa desa, chat, dan dashboard admin desa.

## Menjalankan

```bash
npm start
# buka http://127.0.0.1:5173
```

Tidak ada build step dan tidak ada dependensi. Butuh Node.js 18+ hanya untuk server statis. Service worker hanya aktif lewat `http://`, bukan `file://`.

## Yang sudah jalan

- **Beranda** — banner promo, kategori lingkaran, voucher desa, Promo Kilat dengan countdown, rekomendasi produk, jasa terdekat, kabar desa, dan Warung Semeton.
- **Produk** — pencarian, filter kategori, urutkan (laris/harga/rating), stok, badge terverifikasi, detail + ulasan + tombol "Beri Tahu Teman" (WhatsApp).
- **Keranjang & pesanan** — qty, voucher desa (potongan langsung), ongkir flat (ambil di warung / antar desa / antar kecamatan), COD/transfer/e-wallet, kode pesanan, stok berkurang otomatis, chat ke penjual dibuat otomatis.
- **Jasa** — 5 kategori (pertukangan, pertanian, rumah tangga, event, transportasi), jadwal ketersediaan, ajukan booking (masuk chat), panggil via WhatsApp.
- **Pesan** — chat penjual/pengrajin, quick reply, dan forum "Warung Semeton" (post + balasan).
- **Profil** — pesanan dengan status, produk jualan, ganti bahasa, mode hemat sinyal, antrean sinkronisasi, reset data demo.
- **Titip Jual** — unggah foto dengan kompresi otomatis (canvas, maks. 1000 px, JPEG 75%), produk masuk antrean verifikasi admin.
- **Login admin** — halaman `#/login` (NIP + PIN) khusus admin desa & Duta Digital; dashboard `#/admin` terkunci dan otomatis mengarahkan ke login bila belum masuk. Sesi tersimpan di perangkat, ada tombol Keluar, dan setiap aksi pengelola (setujui/tolak produk, pengumuman, login/logout) tercatat di "Aktivitas pengelola".
  - Akun demo: `JP-001 / 1234` (Lalu Ahmad Fauzi, Admin Desa) dan `JP-002 / 2345` (Inaq Wulan Sari, Duta Digital).
- **Admin desa** — statistik, grafik pesanan per dusun, setujui/tolak produk, blast pengumuman, daftar laporan produk.
- **Offline-first** — seluruh state di `localStorage`; aksi tulis masuk `syncQueue` lalu dikirim otomatis saat online (atau manual lewat Profil → Sinkronkan); service worker meng-cache shell; status online/offline terlihat di header.
- **Ilustrasi produk lokal** — 14 gambar SVG buatan sendiri di `assets/products/`, tanpa dependensi jaringan, tetap tajam di semua ukuran layar.
- **Full-screen responsif** — layout memakai seluruh lebar layar. Di bawah 900 px: header pencarian + bottom nav, grid produk 2–3 kolom. Mulai 900 px: nav atas, grid sampai 4–5 kolom, detail & keranjang dua kolom, chat dua panel, profil dan dashboard admin multi-kolom. Tidak ada frame ponsel di desktop.

## Struktur

```
index.html                  shell aplikasi + navigasi bawah
assets/css/app.css          design system marketplace (hijau/putih/oranye, full-width)
assets/js/i18n.js           kamus ID + Sasak (draf)
assets/js/data.js           data contoh (produk, jasa, chat, forum, admin)
assets/js/store.js          state lokal, keranjang, pesanan, antrean sync
assets/js/app.js            hash router + render + interaksi
assets/products/*.svg       ilustrasi produk lokal (14 gambar)
sw.js                       cache shell offline
manifest.webmanifest        install PWA
server.js                   server statis lokal
```

## Catatan

- Terjemahan **Sasak masih draf** dan perlu ditinjau penutur asli/Duta Digital sebelum dipakai produksi.
- Data bersifat demo dan tersimpan di perangkat. Untuk produksi, ganti `store.js` dengan panggilan REST ke backend (Laravel/Supabase) — bentuk objeknya sudah menyerupai respons API.
- Nomor WhatsApp jasa, akun admin, dan rekening pada contoh transaksi adalah data fiktif. PIN pada login admin hanya untuk demo di perangkat; di produksi verifikasi harus pindah ke server (HTTPS + hash PIN) lewat endpoint seperti `POST /api/admin/login`.
