# PLAN â€” Discord Bot Multifungsi

## 1. Gambaran Proyek

Bangun sebuah bot Discord multifungsi bernama **Global Tech Assistant (GTA)** untuk server komunitas teknologi seperti **Network Intelligence**. Bot harus modular, stabil, aman, mudah dikembangkan, dan memiliki antarmuka interaksi yang rapi menggunakan Slash Commands, Buttons, Select Menus, Modals, serta Embed.

Bot berfungsi sebagai asisten server yang mengelola moderasi, anggota, informasi, komunitas, utilitas, dan integrasi layanan eksternal dalam satu aplikasi.

## 2. Tujuan Utama

- Menggabungkan fitur bot Discord umum dalam satu bot.
- Mengurangi pekerjaan moderator melalui automasi.
- Membantu anggota menemukan informasi, berdiskusi, dan belajar.
- Menyediakan sistem konfigurasi yang dapat diatur per server.
- Menjaga keamanan data, izin, dan aktivitas bot.
- Memastikan setiap modul dapat diaktifkan atau dinonaktifkan secara terpisah.

## 3. Teknologi yang Digunakan

Gunakan teknologi berikut sebagai standar awal:

- **Runtime:** Node.js versi LTS.
- **Library Discord:** discord.js v14 atau versi stabil terbaru yang kompatibel.
- **Bahasa:** JavaScript dengan struktur modular; TypeScript boleh digunakan jika memberi manfaat nyata.
- **Database:** SQLite untuk instalasi sederhana, dengan opsi PostgreSQL untuk skala lebih besar.
- **Konfigurasi:** file `.env` untuk token dan rahasia; jangan pernah menaruh token di source code.
- **Logging:** sistem log terstruktur dengan level `info`, `warn`, dan `error`.
- **Deployment:** mendukung VPS/Linux, Docker, dan layanan hosting Node.js.

Gunakan dokumentasi resmi Discord dan discord.js. Jangan memakai API tidak resmi atau melakukan self-bot.

## 4. Daftar Fitur Utama

### A. Moderation System

Sediakan perintah dan sistem berikut:

- `/warn` â€” memberi peringatan kepada anggota.
- `/warnings` â€” melihat riwayat peringatan.
- `/clear-warnings` â€” menghapus riwayat peringatan dengan izin khusus.
- `/timeout` dan `/untimeout` â€” membatasi atau memulihkan interaksi anggota.
- `/kick` â€” mengeluarkan anggota.
- `/ban` dan `/unban` â€” memblokir atau membuka blokir anggota.
- `/purge` â€” menghapus sejumlah pesan sesuai batas dan izin Discord.
- `/slowmode` â€” mengatur jeda pengiriman pesan.
- `/lock` dan `/unlock` â€” mengunci atau membuka kanal.
- `/nick` â€” mengubah nickname jika bot memiliki izin.
- `/modlogs` â€” melihat catatan tindakan moderasi.
- Alasan tindakan wajib dapat diisi moderator.
- Semua tindakan moderasi dicatat ke kanal log.
- Terapkan pemeriksaan permission, role hierarchy, dan bot permission sebelum menjalankan tindakan.

### B. Auto Moderation & Anti-Raid

- Deteksi spam pesan dan pengulangan teks.
- Deteksi mention berlebihan.
- Filter tautan dan undangan Discord berdasarkan konfigurasi.
- Filter kata atau frasa yang dilarang.
- Pengaturan pengecualian untuk role dan kanal tepercaya.
- Deteksi join massal dalam rentang waktu tertentu.
- Mode lockdown darurat.
- Sistem tindakan bertingkat: hapus pesan, peringatan, timeout, lalu eskalasi moderator.
- Jangan menghukum otomatis berdasarkan satu sinyal yang lemah.
- Sediakan notifikasi moderator dan catatan alasan setiap tindakan otomatis.

### C. Welcome, Goodbye & Member Management

- Pesan sambutan saat anggota bergabung.
- Pesan perpisahan saat anggota keluar.
- Welcome embed yang dapat dikustomisasi.
- Auto role untuk anggota baru.
- Sistem verifikasi anggota melalui tombol atau modal.
- Pesan aturan dan panduan server.
- Informasi akun seperti tanggal bergabung dan usia akun, dengan tetap memperhatikan privasi.
- Role khusus untuk anggota terverifikasi.
- Pesan onboarding yang mengarahkan anggota ke kanal penting.

### D. Auto Role & Reaction Role

- Role berdasarkan tombol, select menu, atau reaction.
- Kategori role: minat teknologi, platform, notifikasi, wilayah, dan status komunitas.
- Admin dapat membuat, mengedit, dan menghapus panel role.
- Mencegah anggota memilih role yang tidak diizinkan.
- Batasi role yang dapat diberikan bot melalui allowlist.
- Panel role harus tetap berfungsi setelah bot restart.

### E. Ticket & Support System

- `/ticket-panel` untuk membuat panel tiket.
- Tombol kategori tiket, misalnya General Support, Technical Support, Report, Partnership, dan Other.
- Setiap tiket dibuat sebagai kanal privat.
- Hanya pembuat tiket dan tim support yang dapat melihat tiket.
- Tombol Claim, Close, Reopen, dan Delete dengan permission yang sesuai.
- Transkrip tiket dapat disimpan secara aman.
- Catat pembuat, petugas, waktu, kategori, dan status tiket.
- Cegah pengguna membuat tiket berlebihan melalui cooldown atau batas tiket aktif.

### F. Leveling, XP & Achievement

- XP berdasarkan aktivitas yang wajar, bukan spam.
- Cooldown pemberian XP.
- Leaderboard server.
- Profil anggota berisi level, XP, dan pencapaian.
- Role reward berdasarkan level.
- Achievement seperti First Message, Active Member, Helpful Member, dan Event Participant.
- Admin dapat mengatur XP, role reward, dan pengecualian kanal.
- Sediakan opsi menonaktifkan leveling.

### G. Utility Commands

- `/avatar` â€” menampilkan avatar anggota.
- `/banner` â€” menampilkan banner profil jika tersedia.
- `/userinfo` â€” informasi dasar anggota.
- `/serverinfo` â€” informasi server.
- `/roleinfo` â€” informasi role.
- `/channelinfo` â€” informasi kanal.
- `/poll` â€” membuat polling.
- `/remind` â€” pengingat satu kali.
- `/ afk` â€” status AFK dan balasan otomatis saat disebut.
- `/timestamp` â€” membuat timestamp Discord.
- `/calculator` â€” kalkulator dasar.
- `/translate` â€” terjemahan melalui layanan API yang sah jika dikonfigurasi.
- `/weather` â€” cuaca melalui API yang sah jika dikonfigurasi.
- `/ping` dan `/botinfo` â€” status dan informasi bot.
- Validasi input dan tangani kegagalan layanan eksternal dengan pesan yang ramah.

### H. Community & Information

- `/suggest` â€” mengirim saran ke kanal suggestion.
- Tombol upvote/downvote untuk saran.
- `/report` â€” laporan anggota atau konten kepada moderator secara privat.
- `/feedback` â€” mengirim masukan.
- `/announce` â€” pengumuman khusus untuk role yang diizinkan.
- `/embed-builder` â€” membuat embed melalui modal atau konfigurasi.
- `/faq` â€” menampilkan pertanyaan umum.
- `/rules` â€” menampilkan aturan server.
- `/resources` â€” menampilkan dokumentasi dan referensi belajar.
- `/event` â€” membuat informasi event dan RSVP sederhana.
- Sistem event harus mendukung pengingat dan daftar peserta.

### I. AI Assistant (Opsional)

- Perintah `/ask` untuk bertanya kepada asisten AI.
- Mendukung pertanyaan seputar teknologi, jaringan komputer, pemrograman, server, dan penggunaan Discord.
- Batasi panjang input dan output.
- Terapkan cooldown per pengguna dan batas penggunaan server.
- Simpan API key di environment variable.
- Jangan mengirim seluruh riwayat percakapan atau data privat server ke layanan AI.
- Berikan penjelasan ketika AI tidak yakin.
- Admin dapat mengaktifkan atau menonaktifkan modul AI.
- Sediakan fallback jika API AI tidak tersedia.

### J. News & RSS Feed (Opsional)

- Integrasi RSS dari sumber berita teknologi dan dunia yang dipilih admin.
- Pengiriman otomatis ke kanal yang ditentukan.
- Cegah berita yang sama terkirim berulang kali.
- Format embed berisi judul, ringkasan singkat, sumber, dan tautan artikel.
- Admin dapat menambah, menghapus, menguji, dan menjeda feed.
- Hormati ketentuan penggunaan sumber dan jangan menyalin isi artikel secara penuh.

### K. Music System (Opsional dan Terpisah)

- Jika modul musik dibuat, gunakan sumber dan metode yang mematuhi ketentuan layanan platform.
- Perintah dasar: play, pause, resume, skip, stop, queue, nowplaying, dan volume.
- Batasi penggunaan berdasarkan kanal suara dan permission.
- Tampilkan antrean lagu melalui embed.
- Jika sumber musik tidak tersedia atau tidak sesuai ketentuan, jangan membuat fitur pengunduhan atau pemutaran melalui cara tidak resmi.
- Modul musik tidak boleh mengganggu modul utama bot.

### L. Logging & Audit

Buat kanal log terpisah atau kategori log yang dapat dikonfigurasi:

- Message Delete.
- Message Edit.
- Member Join/Leave.
- Role Update.
- Nickname Update.
- Channel Create/Delete/Update.
- Voice Join/Leave/Move.
- Moderation Actions.
- Ticket Activity.
- Bot Errors.
- Configuration Changes.

Jangan mencatat token, password, API key, atau informasi sensitif. Sediakan opsi menonaktifkan jenis log tertentu.

### M. Dashboard Web (Opsional)

Buat dashboard web jika ruang lingkup dan waktu memungkinkan:

- Login menggunakan Discord OAuth2.
- Pengguna hanya dapat mengatur server yang memang dapat mereka kelola.
- Halaman overview statistik.
- Pengaturan welcome, moderation, logging, leveling, ticket, RSS, dan AI.
- Form konfigurasi yang tervalidasi.
- Tampilan responsif untuk desktop dan mobile.
- Proteksi CSRF, validasi input, session security, dan rate limiting.
- Jangan menampilkan token bot atau rahasia konfigurasi kepada pengguna dashboard.

## 5. Sistem Konfigurasi

Setiap server harus memiliki konfigurasi sendiri, meliputi:

- Bahasa bot.
- Prefix tampilan jika diperlukan; utamakan Slash Commands.
- Kanal welcome dan goodbye.
- Kanal moderation log.
- Kanal suggestion dan report.
- Role moderator, administrator, dan support.
- Pengaturan auto moderation.
- Pengaturan XP dan level reward.
- Pengaturan ticket.
- Pengaturan RSS dan AI.
- Zona waktu dan format waktu.
- Status aktif/nonaktif setiap modul.

Sediakan perintah `/setup` atau `/config` berbasis menu interaktif. Simpan konfigurasi ke database dan validasi setiap perubahan.

## 6. Struktur Perintah

Gunakan Slash Commands dengan kategori:

- `/admin`
- `/moderation`
- `/automod`
- `/welcome`
- `/autorole`
- `/ticket`
- `/level`
- `/utility`
- `/community`
- `/event`
- `/ai`
- `/news`
- `/config`
- `/help`

Nama dan pengelompokan dapat disesuaikan dengan batasan Discord. Perintah sensitif harus dibatasi berdasarkan permission dan role yang dikonfigurasi.

## 7. Struktur Folder yang Disarankan

```text
discord-bot/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ commands/
â”‚   â”‚   â”œâ”€â”€ moderation/
â”‚   â”‚   â”œâ”€â”€ utility/
â”‚   â”‚   â”œâ”€â”€ community/
â”‚   â”‚   â”œâ”€â”€ ticket/
â”‚   â”‚   â””â”€â”€ admin/
â”‚   â”œâ”€â”€ events/
â”‚   â”œâ”€â”€ interactions/
â”‚   â”œâ”€â”€ modules/
â”‚   â”‚   â”œâ”€â”€ automod/
â”‚   â”‚   â”œâ”€â”€ welcome/
â”‚   â”‚   â”œâ”€â”€ autorole/
â”‚   â”‚   â”œâ”€â”€ leveling/
â”‚   â”‚   â”œâ”€â”€ logging/
â”‚   â”‚   â”œâ”€â”€ rss/
â”‚   â”‚   â””â”€â”€ ai/
â”‚   â”œâ”€â”€ database/
â”‚   â”œâ”€â”€ services/
â”‚   â”œâ”€â”€ utils/
â”‚   â”œâ”€â”€ config/
â”‚   â””â”€â”€ index.js
â”œâ”€â”€ scripts/
â”œâ”€â”€ tests/
â”œâ”€â”€ data/
â”œâ”€â”€ .env.example
â”œâ”€â”€ .gitignore
â”œâ”€â”€ package.json
â”œâ”€â”€ README.md
â”œâ”€â”€ PLAN.md
â””â”€â”€ Dockerfile
```

Jangan menyimpan file database, backup, log privat, atau `.env` di direktori publik.

## 8. Database & Data Model

Buat tabel atau koleksi yang sesuai untuk:

- `guild_settings`
- `user_settings`
- `moderation_cases`
- `warnings`
- `tickets`
- `ticket_messages` atau metadata transkrip
- `leveling`
- `achievements`
- `suggestions`
- `events`
- `rss_feeds`
- `rss_deliveries`
- `reminders`
- `audit_logs`

Gunakan ID Discord sebagai string agar aman dari masalah presisi angka. Tambahkan indeks pada kolom yang sering dicari. Terapkan migrasi database dan backup berkala.

## 9. Keamanan & Permission

- Token bot dan API key wajib menggunakan environment variable.
- Sediakan `.env.example` tanpa nilai rahasia.
- Jangan pernah mengirim token ke chat, log, embed, atau repository.
- Terapkan prinsip least privilege pada permission bot.
- Periksa permission pengguna, bot, dan hierarki role pada setiap tindakan.
- Validasi semua input pengguna.
- Gunakan prepared statements atau ORM untuk mencegah SQL injection.
- Terapkan rate limit dan cooldown.
- Lindungi dashboard dengan OAuth2 dan session yang aman.
- Jangan menyimpan data pribadi yang tidak diperlukan.
- Sediakan perintah untuk menghapus data pengguna sesuai kebijakan privasi.
- Gunakan ephemeral response untuk informasi yang hanya perlu dilihat pemohon.
- Tangani error tanpa membocorkan stack trace atau rahasia kepada anggota.

## 10. Reliability & Error Handling

- Gunakan handler terpusat untuk error.
- Bot harus dapat pulih dari kegagalan modul tanpa menghentikan seluruh aplikasi.
- Tambahkan reconnect handling dan graceful shutdown.
- Hindari event listener ganda.
- Gunakan queue untuk pekerjaan terjadwal atau pengiriman massal.
- Terapkan retry dengan batas dan jeda untuk API eksternal.
- Perhatikan Discord rate limits.
- Simpan status pekerjaan terjadwal agar tidak hilang setelah restart.
- Sediakan health check dan informasi uptime.

## 11. UI/UX Discord

- Gunakan embed yang konsisten, rapi, dan profesional.
- Gunakan warna identitas bot yang dapat diatur.
- Gunakan tombol, select menu, dan modal untuk alur interaktif.
- Semua respons memiliki pesan sukses, gagal, atau sedang diproses yang jelas.
- Tambahkan footer seperlunya, misalnya nama bot dan versi.
- Hindari spam pesan; edit pesan panel yang sama jika memungkinkan.
- Dukung Bahasa Indonesia sebagai bahasa utama dan English sebagai opsi.
- Gunakan nama perintah dan deskripsi yang singkat serta mudah dipahami.

## 12. Testing & Quality Assurance

Sebelum dinyatakan selesai, uji:

1. Bot dapat login dan tetap online.
2. Semua Slash Commands terdaftar dan bekerja.
3. Permission dan role hierarchy berjalan benar.
4. Moderasi tidak dapat digunakan anggota tanpa izin.
5. Welcome dan goodbye bekerja.
6. Auto role dan verifikasi bekerja setelah restart.
7. Ticket bersifat privat dan tombolnya berfungsi.
8. XP tidak dapat dieksploitasi melalui spam.
9. Log mencatat tindakan yang benar.
10. Konfigurasi tiap server tidak tercampur.
11. Database tetap konsisten setelah restart.
12. Error API eksternal tidak menjatuhkan bot.
13. Rate limit Discord ditangani.
14. Token dan data sensitif tidak muncul di log atau repository.
15. Bot berjalan pada VPS atau Docker sesuai panduan.

## 13. Tahapan Pengerjaan

### Tahap 1 â€” Core
- Inisialisasi project.
- Koneksi Discord.
- Database.
- Command handler dan event handler.
- Permission checker.
- Error handler dan logger.

### Tahap 2 â€” Fitur Dasar
- Utility.
- Welcome/goodbye.
- Auto role.
- Moderation.
- Logging.

### Tahap 3 â€” Komunitas
- Ticket.
- Suggestion dan report.
- Leveling dan achievement.
- Event dan reminder.

### Tahap 4 â€” Fitur Lanjutan
- Auto moderation dan anti-raid.
- RSS feed.
- AI assistant.
- Dashboard web.
- Musik hanya jika implementasinya sesuai ketentuan layanan.

### Tahap 5 â€” Finalisasi
- Testing menyeluruh.
- Perbaikan bug.
- Dokumentasi.
- Deployment.
- Backup dan monitoring.

Prioritaskan bot yang stabil. Jangan membuat semua fitur sekaligus dalam satu file. Setiap modul harus bisa diuji dan dinonaktifkan secara terpisah.

## 14. Dokumentasi yang Wajib Dibuat

Buat `README.md` yang berisi:

- Deskripsi bot.
- Daftar fitur.
- Persyaratan instalasi.
- Cara membuat aplikasi dan bot di Discord Developer Portal.
- Cara mengatur `.env`.
- Cara menginstal dependency.
- Cara menjalankan bot.
- Cara deploy ke VPS atau Docker.
- Cara mendaftarkan Slash Commands.
- Cara mengatur permission dan intents.
- Cara backup dan restore database.
- Cara mengaktifkan atau menonaktifkan modul.
- Troubleshooting error umum.

Tambahkan komentar pada bagian kode yang penting dan contoh konfigurasi yang tidak mengandung rahasia.

## 15. Instruksi Akhir untuk AI Developer

Bertindaklah sebagai senior Discord bot developer. Implementasikan proyek berdasarkan dokumen ini secara bertahap, bukan hanya memberikan contoh atau pseudocode.

Ketentuan hasil akhir:

1. Buat seluruh source code yang diperlukan dan pastikan setiap file saling terhubung.
2. Jangan mengklaim fitur selesai jika belum benar-benar diimplementasikan.
3. Jangan menggunakan fungsi atau package fiktif.
4. Gunakan dokumentasi resmi untuk memastikan kompatibilitas API.
5. Jika ada fitur yang membutuhkan API key eksternal, buat konfigurasi opsional dan jelaskan cara mendapatkannya.
6. Jika ada fitur yang belum dapat dibuat, tandai sebagai TODO dan jelaskan alasannya.
7. Sertakan `.env.example`, `.gitignore`, `README.md`, skema/migrasi database, dan pengujian dasar.
8. Jangan pernah menaruh token bot asli di dalam file.
9. Setelah setiap tahap, jalankan pemeriksaan atau tes yang tersedia dan perbaiki error sebelum lanjut.
10. Di akhir, berikan ringkasan fitur yang benar-benar selesai, cara instalasi, cara menjalankan, daftar permission/intents yang dibutuhkan, serta batasan yang masih ada.

**Target akhir:** sebuah Discord bot multifungsi yang modular, aman, profesional, mudah dikonfigurasi, dan siap dikembangkan untuk komunitas teknologi.