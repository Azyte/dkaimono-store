# 🚀 Panduan Eksekusi Setup Template dKaimono (White-Label)

Selamat datang di platform top-up **dKaimono White-Label**. Template ini dirancang untuk Anda jual kembali atau Anda jalankan sendiri sebagai platform *Host-to-Host (H2H)* otomatis tanpa ribet. Anda tidak perlu memasukkan produk satu per satu, sistem ini sudah mendukung penarikan API otomatis.

Berikut adalah panduan lengkap cara *setup* sistem ini dari 0 hingga siap berjualan.

---

## 🟢 1. Kebutuhan Dasar (Persiapan)
Sebelum mendeploy, pastikan Anda telah menyiapkan 3 akun berikut:
1. **GitHub / GitLab**: Untuk menyimpan source code ini.
2. **Supabase**: Sebagai database utama (gratis hingga puluhan ribu transaksi).
3. **Vercel**: Untuk mendeploy website ini agar online secara gratis.
4. **Digiflazz / VIP Reseller**: Sebagai supplier H2H yang akan memproses pesanan otomatis.
5. **Tripay / Midtrans**: Sebagai Payment Gateway (QRIS, E-Wallet, Alfamart) untuk menerima uang dari pembeli otomatis.

---

## 🛠️ 2. Konfigurasi Database (Supabase)
Sistem ini menggunakan Supabase. Ikuti langkah ini untuk mengatur Database Anda:
1. Daftar ke [Supabase.com](https://supabase.com) dan buat Project Baru.
2. Masuk ke menu **SQL Editor**.
3. Di dalam *source code* ini terdapat file `supabase/schema.sql`. Copy seluruh isi file tersebut dan Paste ke SQL Editor Supabase Anda, lalu klik **RUN**.
4. Database Anda kini siap dan memiliki seluruh struktur keamanan yang dibutuhkan.

---

## 🌍 3. Penyesuaian API Keys (.env)
Anda hanya perlu mengatur beberapa konfigurasi Variabel Lingkungan *(Environment Variables)*. Edit file `.env.local` atau atur langsung di pengaturan Vercel Anda:

```env
# Koneksi Database
NEXT_PUBLIC_SUPABASE_URL=https://yyyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# Supplier (Digiflazz)
SUPPLIER_API_URL=https://api.digiflazz.com/v1
SUPPLIER_USERNAME=username_digiflazz_anda
SUPPLIER_API_KEY=production_key_digiflazz_anda

# Payment Gateway (Tripay)
TRIPAY_API_KEY=T-VNDxxx
TRIPAY_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxx
TRIPAY_MERCHANT_CODE=T19xxxx
```

---

## 📦 4. Menyempurnakan Katalog Game (Sekali Klik)
Anda tidak perlu mengetik ratusan game manual.
Kami sudah menyertakan `supabase/seed/game_catalog.json` yang berisi ratusan profil game beresolusi Tinggi (HD) lengkap dengan konfigurasi server seperti Mobile Legends, PUBGM, Netflix, Steam Wallet, hingga Genshin Impact.

**Cara Memuat Katalog Awal:**
Masuk ke Menu Admin Dashboard dKaimono -> Klik **Sync & Supplier** -> Klik tombol **"Load Master Catalog"**.

---

## 🤖 5. Cara Kerja Host-to-Host (Otomatis)
Template ini diprogram agar **Anda bisa tidur sambil menghasilkan uang**.
Alurnya adalah:
1. Pelanggan datang ke website Anda, memasukkan ID Game (Contoh MLBB: 12345 (6789)), lalu memilih nominal Diamond.
2. Pelanggan membayar via **QRIS Tripay**. Uang langsung masuk ke saldo Tripay Anda.
3. Tripay mengirim *Webhook Callback* ke server website ini (`/api/webhooks/tripay`).
4. Server memverifikasi kecocokan harga. Jika Valid, Server secara OTOMATIS menembak API Digiflazz untuk membelikan Diamond ke ID Game pelanggan Anda (menggunakan saldo Digiflazz Anda).
5. Pelanggan mendapatkan notifikasi "Pesanan Sukses!" di layar.
6. Laba = Harga Jual di Web Anda - Harga Modal Digiflazz.

**⚠️ PENTING:** 
Pastikan Anda selalu memiliki saldo yang cukup di Akun Supplier (Digiflazz) Anda agar transaksi tidak gagal saat API melakukan request.

---

## 🎨 6. Kustomisasi Desain
Anda bebas mengubah desain Web ini agar lebih unik atau mengubah Nama/Warna Brand:
1. Ubah warna utama di `/src/app/globals.css` pada bagian `:root`.
2. Ubah Logo utama di `/public/logo.png`.
3. Ganti nama "dKaimono" di `src/lib/constants.ts` dengan Nama Brand Anda sendiri.

Selamat Berjualan! 🚀
