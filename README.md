# FinTar — AI Financial Copilot for Indonesian SMEs (UMKM)

FinTar adalah platform asisten manajemen keuangan cerdas untuk UMKM Indonesia (studi kasus: Viera Bakery), dilengkapi pelacakan arus kas, kalkulasi kapasitas cicilan sehat 30%, OCR struk belanja, draf proposal pinjaman modal usaha otomatis, dan rekomendasi perlindungan asuransi.

---

## 🚀 Panduan Memulai Cepat (Quickstart)

### 1. Prasyarat
- **Node.js**: v18+ atau v20+
- **NPM**: v9+
- Akun **Supabase** (Free Tier) & Akun **Google AI Studio** (Gemini API Free Tier)

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin template `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```

Buka `.env.local` dan isi kredensial Supabase Anda:
```env
# Frontend Client Keys (Aman untuk browser)
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```
> ⚠️ **Penting**: File `.env.local` dan `.env` sudah dimasukkan ke dalam `.gitignore`. Jangan pernah memasukkan (commit) secret key atau service role key ke repositori publik GitHub!

---

## 🗄️ Setup Backend Supabase (Database & Migrasi)

Semua skema database, aturan keamanan **Row Level Security (RLS)**, dan stored procedure seed telah disediakan di folder `supabase/migrations/`:
1. `20261008000000_schema.sql` (13 tabel relasional + strict RLS policies di setiap tabel)
2. `20261008000001_seed.sql` (Katalog produk pembiayaan, asuransi, kurs valuta, & stored procedure `seed_demo_data`)
3. `20261008000002_auth_consent_delete.sql` (Server-side consent enforcement & hak penghapusan data / PDP Right to Erasure)

### Cara Menjalankan Migrasi ke Supabase:

#### Opsi A: Melalui Supabase Web Dashboard (Paling Mudah)
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan pilih project Anda.
2. Klik menu **SQL Editor** di sidebar kiri.
3. Buat New Query, lalu salin dan jalankan (klik **Run**) isi file `supabase/migrations/20261008000000_schema.sql`.
4. Lakukan hal yang sama untuk file `20261008000001_seed.sql` dan `20261008000002_auth_consent_delete.sql`.
5. Buka menu **Table Editor** untuk memverifikasi seluruh tabel telah terbentuk.

#### Opsi B: Melalui Supabase CLI
```bash
npx supabase login
npx supabase link --project-ref <your-project-id>
npx supabase db push
```

---

## 🤖 Konfigurasi Provider AI / LLM (Task 5c)

FinTar menggunakan arsitektur server-side universal LLM Gateway di `supabase/functions/_shared/llm.ts` yang bersifat **provider-agnostic**:
- **`gemini` (Default & Gratis)**: Menggunakan model `gemini-1.5-flash` Google Gemini Free Tier tanpa biaya.
- **`mock` (Offline / Unit Test)**: Respon deterministik instan tanpa memerlukan API key apapun.
- **`anthropic` (Opsional)**: Kompatibel dengan Claude Messages API.

### Menyetel Secrets untuk Supabase Edge Functions:
Jalankan perintah berikut di terminal (ganti dengan key asli Anda):
```bash
npx supabase secrets set LLM_PROVIDER=gemini GEMINI_API_KEY=<your-gemini-key>
```

Untuk memeriksa status provider aktif tanpa membocorkan API key:
```bash
curl https://<your-project-id>.supabase.co/functions/v1/llm-status
```

### 🔒 Privasi Data & Kebijakan Free Tier LLM (Consent & Privacy Notice)
- **Batasan Data**: Data transaksi UMKM yang dikirim ke LLM provider dibatasi hanya pada data yang telah disetujui secara eksplisit oleh pengguna melalui toggle perizinan (`ai_processing` consent).
- **Google Gemini Free Tier Terms**: Harap dicatat bahwa Google AI Studio free tier dapat menggunakan data interaksi untuk peningkatan layanan sesuai ketentuan penggunaannya. Oleh karena itu, untuk lingkungan pengujian atau demonstrasi, **hanya gunakan data simulasi / demo data** (seperti dataset Viera Bakery). Jangan memasukkan data finansial rahasia pribadi jika menggunakan free tier tanpa akun perusahaan berbayar.

---

## 🧪 Validasi & Pengujian

Jalankan rangkaian pengujian otomatis untuk memverifikasi logika finansial, RLS, dan modul LLM:
```bash
# 1. Jalankan Unit Tests (Vitest)
npm test

# 2. Periksa Type Checking TypeScript
npx tsc --noEmit

# 3. Build Production Bundle
npm run build
```

---

## 📦 Menjalankan Aplikasi Lokal
```bash
npm run dev
```
Buka browser di `http://localhost:5173`.
