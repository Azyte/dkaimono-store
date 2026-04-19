# Pivot to Ultimate White-Label Top-Up Template

This plan outlines the architectural transformation of dKaimono from a single-tenant application into a **Premium White-Label Template** designed for you to sell to other business owners. 

The goal is that whoever buys this template from you only needs to fill in their API Keys (`.env`), run a quick database sync, and instantly have a production-ready Top-Up Website with hundreds of games and automatic payment processing.

## 🎯 Target Architecture

To make this template highly valuable and easy to sell, we will implement **H2H (Host-to-Host) Auto-Processing**. Buyers will connect your template to popular Indonesian suppliers (like **Digiflazz**, **VocaGame**, or **VIP Reseller**) and automatic payment handlers (like **Tripay** or **Midtrans**).

### 1. Massive Pre-Loaded Catalog (No Manual Entry)
Buyers hate entering games one by one. I will do a deep search and create a massive JSON database seed (`games_catalog.json`) containing high-quality HD icons and cover images for:
- **Mobile Games:** MLBB, Free Fire, PUBG, Genshin Impact, Honkai, COD Mobile, eFootball, etc.
- **PC Games:** Valorant, Point Blank, League of Legends.
- **Console & Vouchers:** Steam Wallet, PlayStation Network (PSN), Nintendo eShop, Google Play.
- **Premium Apps:** Netflix, Spotify, Canva Pro, YouTube Premium.

### 2. Auto-Pricing & Sync Engine (Admin Panel)
Instead of manually typing prices, the Admin Panel will have a **"Sync with Supplier"** button. 
- The buyer inputs their Supplier API Key (e.g., Digiflazz).
- The system automatically fetches their reseller prices, adds a global markup (e.g., +10% profit margin), and stores the products in the database.

### 3. Fully Automated Transaction Flow
When an end-user buys on the template website:
1. User pays via Tripay (QRIS/E-Wallet).
2. The template receives a Webhook from Tripay confirming payment.
3. The template automatically fires an API Request to Digiflazz/Supplier to process the top-up.
4. User receives the diamond/item instantly.

### 4. Template Buyer Documentation ("How to Use")
We will write a pristine, highly professional `SETUP_GUIDE.md` designed specifically for your buyers. It will explain:
- How to set up their own Supabase.
- Where to get Supplier API Keys.
- Where to get Payment Gateway Keys.
- How to deploy to Vercel in 1-Click.

---

## 🛠️ Proposed Changes

### Database & Seed Layer
- **[NEW]** `supabase/seed/catalog.json`: A master file containing the 50+ HD game configurations.
- **[MODIFY]** `src/types/database.ts`: Extend the schema to include `supplier_code` and `provider_id` for API bridging.

### Admin Tools (The "Template Engine")
- **[NEW]** `src/app/admin/supplier-sync/page.tsx`: A dashboard page for buyers to configure Digiflazz/VocaGame API keys and trigger the automatic product synchronization.
- **[NEW]** `src/app/api/admin/sync/route.ts`: The backend logic to pull thousands of products from the 3rd party API and map them to the pre-loaded games.

### Order Auto-Processing
- **[MODIFY]** `src/app/api/orders/route.ts`: Implement the Host-to-Host (H2H) outbound request logic.
- **[NEW]** `src/app/api/webhooks/tripay/route.ts`: Payment gateway callback receiver.

---

## ⚠️ User Review Required
> [!IMPORTANT]
> **Pilihan Supplier API:** Dari riset ekstensif pasar Indonesia, supplier API (H2H) yang paling lengkap, murah, dan umum dipakai oleh *template reseller* adalah **Digiflazz** dan **Apigames**. 
> Saya merekomendasikan template ini dikunci/diintegrasikan dengan **Digiflazz API** karena dokumentasinya paling unggul. Apakah Anda setuju kita bangun sistemnya mengikuti format API Digiflazz? Ataukah Anda punya *supplier API* spesifik yang wajib didukung template ini?

> [!TIP]
> **Database Game:** Sebentar lagi saya akan membangun arsip JSON berisi puluhan game PC/Mobile/Voucher HD. Saya akan meriset sendiri gambar-gambar HD-nya dari web. Apakah ada kategori khusus yang menurut Anda *wajib* dimasukkan agar template Anda makin mahal saat dijual?

Silakan setujui rencana ini, atau beri masukan mengenai integrasi Supplier dan Payment Gateway yang Anda inginkan.
