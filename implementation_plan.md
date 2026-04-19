# 🔥 Phase 2: Codashop Redesign & Real ID Checker

Berdasarkan permintaan Anda, kita akan melakukan *perombakan total* pada tampilan depan agar memiliki estetika profesional kelas kakap layaknya **Codashop** atau **Unipin**, serta menyelesaikan masalah gambar *broken* di Vercel, dan mengimplementasikan **Validasi ID Asli**.

## 🎯 Target Arsitektur & Perubahan

### 1. Fix Vercel Broken Images
Gambar saat ini rusak *(broken)* di Vercel karena keamanan Next.js 14 yang memblokir domain gambar eksternal (seperti Google Play & Unsplash). 
- **Solusi:** Kita akan mengkonfigurasi `next.config.mjs` untuk mengizinkan (whitelist) semua domain eksternal dengan protokol HTTPS, sehingga gambar apapun yang ditarik dari API/H2H (Digiflazz dll) akan otomatis dirender dengan baik.

### 2. UI/UX Redesign - Codashop & Unipin Style
Tampilan grid saat ini terlalu "kaku/kotak" layaknya toko online biasa. Kita akan menyulapnya menjadi nuansa Game Top-Up Premium:
- **Banner Carousel Megah:** Menambahkan sistem *sliding banner* promo di bagian paling atas.
- **Kategori Navigasi (Tabs):** Menambahkan filter "Populer", "Mobile Games", "Voucher", dll.
- **Card Design Epik:** Mengubah rasio *card* agar gambar cover lebih menonjol ke atas (portrait style atau rounded square) persis seperti Unipin, dengan efek animasi *hover* melayang.
- **Tampilan Kepadatan Tinggi (High Density):** Mengubah grid agar menampilkan lebih banyak game dalam satu baris (Responsif: 6 baris untuk PC, 3 baris untuk Mobile).

### 3. Validasi Akun Game Asli (Real API Checker)
Saat ini sistem verifikasi ID hanyalah form tiruan *(mock)*. Pembeli template pasti menginginkan fitur "Cek Nickname Otomatis" saat memasukkan ID.
- **Rencana Rute Baru:** Membuat `/api/checker/route.ts` yang akan secara agresif menembak API Cek ID Game Publik/H2H (seperti menggunakan API VocaGame atau API Cek ID publik).
- **Proses Flow:** Ketika *User* / Pembeli mengetik ID Game (Misal: 12345 (6789)), nama aslinya (Misal: **AzyteGaming**) akan muncul secara langsung di layar sebelum tombol Lanjutkan/Beli aktif.

---

## 🛠️ Komponen yang Akan Diupdate

#### [MODIFY] `next.config.mjs`
Menyisipkan konfigurasi `remotePatterns` untuk mengizinkan semua gambar eksternal.

#### [MODIFY] `src/app/globals.css`
Merombak token desain *(design system)* untuk mendukung tampilan Codashop (Background navy gelap, aksen oranye/ungu menyala).

#### [MODIFY] `src/components/home/GameList.tsx`
Menulis ulang logika tampilan menggunakan *Tab Navigation* dan Card bergaya *Premium Portrait*.

#### [NEW] `src/app/api/checker/route.ts`
Membuat *Route Handler* backend untuk validasi ID.

#### [MODIFY] `src/components/game/GameTopUp.tsx`
Menambahkan fitur *debouncing* pada Input ID (saat user mengetik ID, sistem menahan 1 detik, lalu memanggil API Checker, dan memunculkan notifikasi Hijau dengan memuat Nickname In-Game Asli).

---

## ⚠️ User Review Required
> [!IMPORTANT]
> **API Cek Nickname Game:** Untuk mengecek ID asli (seperti Mobile Legends dan Free Fire) dibutuhkan *API Checker* yang bekerja 24 jam. Saya akan membangun infrastrukturnya menggunakan *endpoint* publik yang sering dipakai komunitas Indonesia, ATAU mengarahkannya ke struktur API VocaGame/Digiflazz. 
> 
> **Pertanyaan untuk Anda:** Apakah Anda setuju saya langsung menggunakan struktur API Cek ID Publik (gratis) untuk disertakan ke dalam Template, lalu Anda bebas mengubah *url endpoint*-nya nanti sesuai keinginan pembeli template Anda?

Silakan setujui rencana ini, dan saya akan merenovasi total tampilan dan sistem keamanannya malam ini juga!
