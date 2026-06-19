<div align="center">
  <h1>✨ KasChain</h1>
  <p><strong>Decentralized Financial Tracker Powered by AI & Web3</strong></p>
</div>

---

## 📌 Tentang KasChain

**KasChain** adalah aplikasi pencatatan keuangan berbasis AI (Google Gemini) dan Web3 (Stellar blockchain) yang dirancang khusus untuk transparansi "Kas Bersama" dalam organisasi, komunitas, atau individu.

Dengan memadukan kecerdasan buatan untuk memudahkan input data melalui percakapan alami (NLP) dan keandalan blockchain Stellar untuk transparansi data yang tidak bisa dimanipulasi (immutable), KasChain membawa pengelolaan keuangan ke level yang lebih modern, aman, dan mudah digunakan.

## 🚀 Fitur Utama

- **🤖 AI-Powered Input:** Lupakan form pencatatan yang rumit. Cukup ketik transaksi Anda seperti sedang mengobrol (misal: *"Beli makan siang 35rb"*), dan Gemini AI akan mengekstrak data tersebut menjadi format JSON terstruktur.
- **🔗 Web3 Transparency:** Setiap transaksi penting akan dicatat sebagai *hash* ke dalam *Smart Contract* di jaringan Stellar (Soroban), memastikan riwayat keuangan organisasi tidak dapat diubah secara sepihak.
- **💳 Seamless Wallet Integration:** Terhubung dengan mulus menggunakan Freighter Wallet. Mendukung pembuatan *keypair* baru maupun integrasi dengan *wallet* yang sudah ada.
- **🧊 Modern Glassmorphism UI:** Desain antarmuka premium, transparan, dan responsif, merepresentasikan nilai inti aplikasi: **Keterbukaan (Transparansi)**.

## 🛠 Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router v6
- **AI Integration:** Google Gemini API (`gemini-2.5-pro`)
- **Blockchain / Web3:** Stellar Testnet (via Soroban Smart Contracts), `@stellar/stellar-sdk`
- **Wallet Provider:** Freighter API (`@stellar/freighter-api`)
- **Database / Sync:** Firebase Firestore (Realtime Sync)
- **Styling:** Custom CSS Variables dengan efek *Glassmorphism*

## 🗺 Roadmap Pengembangan (Sistem Sabuk)

KasChain dibangun secara bertahap menggunakan sistem progresi Sabuk (Rise In):

1. **⚪️ Sabuk Putih (Fondasi):** Pembuatan wallet, interaksi dasar Stellar (Friendbot, cek saldo, kirim XLM).
2. **🟡 Sabuk Kuning (Integrasi):** Penambahan AI Chat dasar (Gemini), integrasi Firestore, dan *Smart Contract* pencatat transaksi dasar (`TransactionLogger`).
3. **🟠 Sabuk Oranye (Kas Bersama):** *Group Ledger* desentralisasi dengan fitur undang anggota dan pelacakan saldo kas bersama on-chain.
4. **🟢 Sabuk Hijau (Production-Ready):** Penyempurnaan AI, fitur otorisasi transaksi multi-sig (Perlu Persetujuan), dan *Dashboard Analytics*.
5. **🔵 Sabuk Biru (Growth):** Fokus pada uji coba 50+ pengguna pertama dan iterasi berdasarkan *feedback* nyata.
6. **⚫️ Sabuk Hitam (Mainnet):** Peluncuran di Stellar Mainnet, audit keamanan, dan penambahan fitur *advanced* (pembayaran nyata/fiat-on-ramp).

## 💻 Panduan Menjalankan Aplikasi (Lokal)

### Persyaratan
- Node.js (v18+ direkomendasikan)
- Freighter Wallet Extension (Terpasang di browser)

### Instalasi & Setup

1. **Kloning Repositori:**
   ```bash
   git clone <repo-url>
   cd kaschain/frontend
   ```

2. **Instalasi Dependencies:**
   ```bash
   npm install
   ```

3. **Pengaturan Environment Variables:**
   Buat file `.env` di folder `frontend` dan tambahkan variabel berikut:
   ```env
   VITE_HORIZON_URL=https://horizon-testnet.stellar.org
   VITE_STELLAR_NETWORK=TESTNET
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses di `http://localhost:5173`.

## 📜 Smart Contract (Soroban)

Kode *smart contract* berbasis Rust dapat ditemukan di dalam direktori `contracts/kaschain/`. Contract ini berfungsi sebagai _Transaction Logger_ untuk memastikan setiap pengeluaran atau pemasukan yang dicatat tidak dapat dihapus atau diubah diam-diam.

Untuk mengkompilasi *smart contract*:
```bash
cd contracts/kaschain
cargo build --target wasm32-unknown-unknown --release
```

## 📸 Screenshots (Submission Requirements)

Berikut adalah tangkapan layar yang menunjukkan fungsionalitas utama aplikasi pada tahap ini:

### 1. Wallet Connected State

![Wallet Connected](./wallet.png) 

### 2. Balance Displayed

![Balance Displayed](./balance.png) 

### 3. Successful Testnet Transaction

![Successful Transaction](./transaction-form.png) 

### 4. Transaction Result Shown to the User

![Transaction Result](./transaction-result.png) 

---
*KasChain — Mewujudkan transparansi finansial bagi setiap komunitas melalui kekuatan AI dan Web3.*
