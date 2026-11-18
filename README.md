# Global Tech Assistant (GTA) 🤖

**Global Tech Assistant (GTA)** adalah bot Discord multifungsi modular berkinerja tinggi yang dirancang khusus untuk komunitas teknologi, pemrograman, jaringan komputer (*Network Intelligence*), dan server modern. Dibangun menggunakan **Node.js LTS**, **Discord.js v14**, dan **SQLite** dengan arsitektur modular yang stabil, aman, dan mudah diperluas.

---

## 🌟 Fitur Utama

### 1. 🛡️ Moderation System
- `/warn` — Memberikan peringatan resmi kepada anggota.
- `/warnings` — Menampilkan riwayat peringatan anggota.
- `/clear-warnings` — Menghapus seluruh riwayat peringatan (Admin).
- `/timeout` & `/untimeout` — Membatasi atau mencabut mute/timeout anggota dengan validasi durasi (hingga 28 hari).
- `/kick` — Mengeluarkan anggota dari server dengan alasan.
- `/ban` & `/unban` — Memblokir atau membuka blokir pengguna (mendukung opsi penghapusan pesan hingga 7 hari).
- `/purge` — Menghapus pesan massal (1 - 100) dengan filter target opsional.
- `/slowmode` — Mengatur jeda pengiriman pesan kanal.
- `/lock` & `/unlock` — Mengunci atau membuka kanal teks.
- `/nick` — Mengubah nama panggilan (nickname) anggota.
- `/modlogs` — Melihat catatan tindakan moderasi terbaru.
- **Role Hierarchy & Safety:** Memeriksa permission dan hierarki role agar moderator tidak dapat menyalahgunakan perintah terhadap pemilik server, bot, atau role yang lebih tinggi.

### 2. ⚙️ Auto Moderation & Anti-Raid
- **Anti-Spam Velocity:** Mendeteksi pengiriman pesan cepat berturut-turut (velocity) dan duplikasi teks berulang.
- **Mass Mention Filter:** Mencegah ping berlebihan atau mention massal.
- **Discord Invite & Link Filter:** Mencegah promosi server lain dan tautan luar secara otomatis.
- **Bad Words Filter:** Menyaring kata terlarang berbasis regex dan batasan kata (*word boundary*).
- **Anti-Raid Detector:** Memantau lonjakan anggota baru dalam rentang waktu singkat (misal >8 join dalam 10 detik) dan mengirimkan peringatan darurat.
- `/lockdown` — Mengunci atau membuka seluruh kanal teks server dalam situasi darurat.
- `/automod` — Mengatur status toggle, menambahkan atau menghapus kata terlarang.

### 3. 👋 Welcome, Goodbye & Verifikasi
- Pesan sambutan otomatis dengan embed interaktif dan penggantian placeholder (`{user}`, `{username}`, `{server}`, `{memberCount}`).
- Pesan perpisahan saat anggota keluar.
- **Auto Role:** Otomatis memberikan role tertentu saat anggota pertama kali bergabung.
- **Sistem Verifikasi:** Tombol `Verifikasi Anggota` interaktif yang memberikan role terverifikasi secara instan.

### 4. 🎭 Auto Role & Reaction Role
- `/autorole-panel` — Membuat panel pemilihan role mandiri berbasis tombol interaktif.
- Terhubung dengan allowlist database untuk mencegah anggota memilih role di luar otoritas.
- Berfungsi penuh dan persisten meskipun bot direstart.

### 5. 🎫 Ticket & Support System
- `/ticket-panel` — Memasang panel bantuan dengan menu dropdown pilihan kategori:
  - *General Support*
  - *Technical Support*
  - *Report Member / Content*
  - *Partnership / Sponsorship*
  - *Other Inquiries*
- Membuat kanal privat dengan izin hanya untuk pembuat tiket dan tim staf/support.
- Tombol aksi: **Claim Tiket**, **Tutup Tiket**, dan **Hapus Kanal**.
- Pembuatan transkrip pesan otomatis yang disimpan dengan aman saat tiket ditutup.
- Batasan maksimal 3 tiket aktif per pengguna untuk mencegah spam tiket.

### 6. ⭐ Leveling & XP System
- Perolehan XP adil dengan cooldown 60 detik dan filter anti-spam (pesan minimal 3 karakter).
- Perhitungan kurva level progresif kuadratik: `XP = 5 * (level^2) + 50 * level + 100`.
- `/rank` — Menampilkan kartu peringkat, level, total pesan, dan *progress bar* menuju level berikutnya.
- `/leaderboard` — Menampilkan 10 anggota teratas dengan aktivitas dan XP tertinggi.
- `/setxp` — Perintah khusus admin untuk menyesuaikan XP pengguna.
- Dukungan reward role otomatis saat mencapai level tertentu.

### 7. 🛠️ Utility Commands
- `/ping` & `/botinfo` — Latensi WebSocket, roundtrip, spesifikasi RAM, OS, CPU, dan uptime bot.
- `/userinfo`, `/serverinfo`, `/roleinfo`, `/channelinfo` — Detail lengkap entitas Discord.
- `/avatar` & `/banner` — Menampilkan avatar dan banner profil dalam resolusi tinggi.
- `/poll` — Polling interaktif dengan tombol reaksi otomatis (1-4 pilihan).
- `/remind` — Pengingat otomatis dengan pengiriman pesan saat waktu tiba.
- `/afk` — Mengatur status AFK dan mengirim notifikasi saat di-mention oleh anggota lain.
- `/timestamp` — Generator kode timestamp dinamis Discord (`<t:unix:R>`, `<t:unix:F>`).
- `/calculator` — Kalkulator matematika aman (bebas evaluasi berbahaya).
- `/translate` — Penerjemah multi-bahasa otomatis.
- `/weather` — Prakiraan cuaca terkini di berbagai kota di dunia via Open-Meteo API.

### 8. 💬 Komunitas & Informasi
- `/suggest` — Mengirim ide saran ke kanal khusus dengan tombol **Upvote** & **Downvote** real-time.
- `/report` — Melaporkan pelanggaran anggota langsung ke kanal moderator secara rahasia.
- `/feedback` — Memberikan ulasan dan masukan untuk server.
- `/announce` — Menyiarkan pengumuman resmi dengan opsi `@everyone`.
- `/embed-builder` — Membuat embed pengumuman kustom secara fleksibel.
- `/faq`, `/rules`, `/resources` — Direktori panduan, aturan server, dan referensi belajar teknologi.
- `/event` — Membuat jadwal acara komunitas lengkap dengan tombol registrasi peserta (RSVP).

### 9. 🤖 AI Assistant (/ask) & 📰 RSS News Feeds
- `/ask` — Menjawab pertanyaan seputar teknologi, koding, dan jaringan komputer menggunakan integrasi Google Gemini Flash API atau OpenAI.
  - Dilengkapi cooldown 10 detik per pengguna untuk menjaga kuota API.
  - Penanganan error ramah pengguna dengan *safe fallback*.
- `/news` — Mengelola integrasi RSS Feed berita teknologi (tambah, daftar, hapus sumber). Bot secara periodik mengambil berita terbaru dan menyiarkannya tanpa duplikasi (*GUID check*).

### 10. 📋 Logging & Audit
Mencatat seluruh aktivitas server ke kanal audit log:
- Pesan Dihapus (*Message Deleted*) dengan isi konten asli.
- Pesan Disunting (*Message Edited*) dengan perbandingan sebelum/sesudah.
- Anggota Bergabung & Keluar.
- Perubahan Role & Nickname Anggota.
- Aktivitas Voice Channel (Join, Leave, Move).
- Tindakan Moderasi (Warn, Timeout, Kick, Ban).

---

## 📋 Persyaratan Sistem
- **Node.js:** Versi 20 LTS atau lebih baru (v20+, v22+, v26+ didukung).
- **OS:** Windows, Linux (Ubuntu/Debian/CentOS), atau macOS.
- **Docker:** (Opsional jika ingin menjalankan melalui kontainer).

---

## 🛠️ Panduan Instalasi & Persiapan

### 1. Buat Bot di Discord Developer Portal
1. Kunjungi [Discord Developer Portal](https://discord.com/developers/applications).
2. Klik tombol **New Application**, beri nama aplikasi (contoh: `Global Tech Assistant`).
3. Masuk ke tab **Bot**:
   - Klik **Add Bot** atau **Reset Token** untuk mendapatkan **Bot Token**. Salin token ini.
   - Gulir ke bawah ke bagian **Privileged Gateway Intents**, lalu AKTIFKAN:
     - ✅ **Presence Intent**
     - ✅ **Server Members Intent** (Wajib untuk Welcome & Moderasi)
     - ✅ **Message Content Intent** (Wajib untuk AutoMod & Leveling)
4. Masuk ke tab **OAuth2 > URL Generator**:
   - Pilih scope: `bot` dan `applications.commands`.
   - Pilih permissions: `Administrator` (atau pilih: Manage Channels, Manage Roles, Kick Members, Ban Members, Moderate Members, Send Messages, Embed Links, Attach Files, Read Message History, Add Reactions, Use External Emojis).
   - Buka tautan URL yang dihasilkan di browser untuk mengundang bot ke server Discord Anda.

### 2. Konfigurasi Lingkungan (`.env`)
Salin file template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan masukkan kredensial:
```env
DISCORD_TOKEN=masukkan_token_bot_anda_di_sini
DISCORD_CLIENT_ID=masukkan_application_id_anda
DISCORD_GUILD_ID=id_server_test_anda_opsional

# API Tambahan (Opsional)
GEMINI_API_KEY=api_key_google_gemini_anda
OPENAI_API_KEY=api_key_openai_anda
```

### 3. Menginstal Dependensi
Jalankan perintah berikut di direktori proyek:
```bash
npm install
```

### 4. Mendaftarkan Slash Commands
Sebelum bot dapat menampilkan menu perintah di Discord, daftarkan seluruh Slash Command ke Discord API:
```bash
npm run deploy
```
> **Tips:** Jika `DISCORD_GUILD_ID` diisi di file `.env`, perintah akan terdaftar secara instan di server tersebut (sangat direkomendasikan saat tahap development). Jika dikosongkan, perintah akan didaftarkan secara global (memerlukan waktu sinkronisasi hingga 1 jam di Discord).

### 5. Menjalankan Bot
Jalankan bot dengan:
```bash
npm start
```

---

## 🧪 Pengujian Otomatis (Testing)
Proyek ini dilengkapi dengan unit & integration test komprehensif tanpa memerlukan koneksi Discord aktif:
```bash
npm test
```
Tes ini menguji:
- Inisialisasi database SQLite in-memory & integritas skema.
- Operasi CRUD tabel pengaturan guild & rules AutoMod.
- Utilitas parsing waktu & kalkulasi timestamp Discord.
- Sanitasi teks, filter regex tautan, invite Discord, dan deteksi bad words.
- Formula matematika kurva leveling dan XP.
- Validasi struktur 51 Slash Commands & 9 Gateway Events.

---

## 🐳 Deployment Menggunakan Docker

### Menjalankan dengan Docker Compose
```bash
docker-compose up -d --build
```

### Memeriksa Log Kontainer
```bash
docker-compose logs -f
```

---

## ⚙️ Panduan Setup Cepat di Discord

Setelah bot online di server Anda, jalankan perintah berikut secara berurutan:

1. **/setup**  
   Melihat panduan langkah demi langkah inisialisasi server.
2. **/config channels**  
   Pilih kanal untuk:
   - `welcome` (kanal sambutan anggota)
   - `goodbye` (kanal perpisahan)
   - `log` (kanal audit log dan catatan moderasi)
   - `suggestion` (kanal ide saran komunitas)
   - `report` (kanal laporan rahasia tim moderator)
3. **/config roles**  
   Pilih role operasional:
   - `auto_role` (role otomatis saat join)
   - `verified_role` (role setelah klik verifikasi)
   - `mod_role` (role moderator)
   - `admin_role` (role administrator)
4. **/ticket-panel**  
   Kirimkan panel tiket ke kanal bantuan publik.
5. **/autorole-panel**  
   Buat tombol pemilihan role mandiri untuk anggota komunitas.

---

## 💾 Backup & Restore Database SQLite

Database disimpan di `./data/gta_bot.sqlite`.

- **Backup Database:**
  Cukup salin file database ke tempat aman saat bot sedang idle atau matikan bot sejenak:
  ```bash
  cp data/gta_bot.sqlite data/gta_bot_backup_$(date +%F).sqlite
  ```
- **Restore Database:**
  Ganti kembali file `gta_bot.sqlite` dengan file backup yang diinginkan, lalu restart bot.

---

## ❓ Troubleshooting & Pertanyaan Umum

1. **Bot online tapi pesan Slash Command tidak muncul di Discord?**
   - Pastikan Anda sudah menjalankan `npm run deploy`.
   - Pastikan bot diundang dengan scope `applications.commands`.
   - Gunakan `DISCORD_GUILD_ID` di `.env` agar perintah langsung muncul tanpa menunggu cache global.

2. **Auto role atau Welcome Message tidak berfungsi saat ada anggota baru?**
   - Periksa tab **Bot** di Discord Developer Portal, pastikan **Server Members Intent** telah diaktifkan (ON).
   - Pastikan posisi role bot berada **LEBIH TINGGI** daripada role yang ingin diberikan oleh bot di daftar Hierarki Role server Discord (*Server Settings > Roles*).

3. **AutoMod atau Leveling tidak menghitung pesan?**
   - Pastikan **Message Content Intent** telah diaktifkan (ON) di Developer Portal.
   - Pastikan kanal tersebut tidak dimasukkan ke dalam daftar pengecualian.

---

## 📄 Lisensi & Kontributor
Proyek ini dirancang di bawah lisensi MIT untuk komunitas teknologi **Network Intelligence**.
Dibuat dengan dedikasi tinggi untuk ketertiban, keamanan, dan produktivitas komunitas.
