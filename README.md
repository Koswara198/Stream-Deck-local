# 🎮 Stream Deck Local

Stream deck berbasis web yang bisa dikontrol lewat HP. Dibuat pakai Astro + Node.js, konek ke Streamlabs via WebSocket.

---

## 📋 Daftar Isi

- [Yang Lo Butuhkan](#-yang-lo-butuhkan)
- [Instalasi Pertama Kali](#-instalasi-pertama-kali)
- [Cara Pake Sehari-hari](#-cara-pake-sehari-hari)
- [Fitur](#-fitur)
- [Struktur File](#-struktur-file)
- [Troubleshooting](#-troubleshooting)

---

## 🛠 Yang Lo Butuhkan

Sebelum mulai, pastiin ini semua udah ada di laptop streaming:

| Software | Link Download | Keterangan |
|---|---|---|
| **Node.js** (v18+) | https://nodejs.org | Pilih yang **LTS** |
| **Streamlabs** | https://streamlabs.com | Harus nyala waktu streaming |

> **Penting:** Laptop dan HP harus konek ke **WiFi yang sama**.

---

## 🚀 Instalasi Pertama Kali

Lakukan ini **sekali saja** di awal.

### 1. Install Dependencies

Buka terminal / command prompt di folder project, jalanin:

```bash
npm install
```

### 2. Jalanin START.bat untuk Pertama Kali

Dobel klik `START.bat`. Karena file `.env` belum ada, script akan **otomatis membuatnya** dan Notepad akan terbuka.

**Cara ambil API Token Streamlabs:**
1. Buka Streamlabs
2. Klik ikon ⚙️ **Settings** (pojok kiri bawah)
3. Pilih **Remote Control**
4. Copy token yang ada di sana

Di Notepad, ganti `ISI_TOKEN_STREAMLABS_DI_SINI` dengan token lo, lalu **Save** dan **tutup Notepad**.

Jalanin `START.bat` lagi.

> IP dan port Streamlabs akan **auto-detect** tiap `START.bat` dijalanin — ga perlu diisi manual.

### 3. Setup Browser Source di Streamlabs (Sekali Saja)

Saat pertama kali `START.bat` dijalanin dengan token yang bener, script otomatis membuat 2 Browser Source di scene yang lagi aktif:

| Source | Fungsi | Ukuran |
|---|---|---|
| `ALERTS` | Overlay meme/video | 480x480px |
| `ticker` | Teks berjalan | 480x60px |

**⚠️ PENTING — Setelah source dibuat pertama kali, lo harus refresh manual sekali:**

1. Di Streamlabs, klik source `ALERTS` di panel Sources
2. Klik tombol **"Refresh cache of current page"** (ada di properties source)
3. Ulangi untuk source `ticker`

> Ini cukup **sekali saja**. Setelah itu source akan otomatis load tiap `START.bat` dijalanin.

---

## 🎯 Cara Pake Sehari-hari

Tiap mau streaming, cukup:

1. **Buka Streamlabs** dulu
2. **Dobel klik `START.bat`** di folder project
3. Tunggu sampai muncul `🎉 Streamlabs siap!`
4. Browser di laptop otomatis kebuka
5. **Buka di HP:** ketik URL yang muncul di terminal (contoh: `http://192.168.x.x:4321`)

Selesai! Kontrol stream dari HP.

---

## ✨ Fitur

### 🎮 Scene Switching (`/`)
- Tombol scene otomatis menyesuaikan scene yang ada di Streamlabs
- Scene yang lagi aktif di-highlight
- Ganti scene langsung dari HP

### 🎬 Meme Board (`/meme`)
- Trigger meme/video/gif langsung muncul di overlay stream
- Tambah meme baru via drag & drop file
- Hapus meme dengan konfirmasi
- Data meme tersimpan permanen (ga hilang walau server restart)

### 📺 Ticker (`/ticker`)
- Jalanin/stop teks berjalan di bagian atas layar stream
- Edit teks langsung dari HP
- Teks tersimpan di browser (ga hilang walau tab ditutup)

---

## 📁 Struktur File

```
stream-deck-local/
├── src/
│   ├── pages/
│   │   ├── index.astro          # Halaman utama stream deck
│   │   ├── meme.astro           # Meme board
│   │   ├── ticker.astro         # Kontrol ticker (dari HP)
│   │   ├── display.astro        # Overlay meme (di Streamlabs)
│   │   ├── ticker-display.astro # Overlay ticker (di Streamlabs)
│   │   └── api/
│   │       ├── meme.ts          # API trigger meme
│   │       ├── memes.ts         # API CRUD daftar meme
│   │       └── ticker.ts        # API state ticker
│   └── data/
│       └── memes.json           # Database meme (auto-generate)
├── public/
│   └── memes/                   # Folder file video/gif meme
├── .env                         # Konfigurasi (auto-generate, jangan di-commit!)
├── setup.mjs                    # Script auto-setup IP & Streamlabs
├── START.bat                    # Dobel klik ini buat mulai
└── package.json
```

---

## 🔧 Troubleshooting

### ❌ Notepad terbuka minta isi token
- Buka Streamlabs → Settings → Remote Control → copy token
- Di Notepad, ganti `ISI_TOKEN_STREAMLABS_DI_SINI` dengan token lo
- Save, tutup Notepad, jalanin `START.bat` lagi

### ❌ "Streamlabs tidak bisa dikonek"
- Pastiin Streamlabs udah dibuka **sebelum** dobel klik `START.bat`
- Di Streamlabs: Settings → Remote Control → pastiin Remote Control aktif

### ❌ Meme tidak muncul di stream
- Pastiin source `ALERTS` ada di scene yang lagi dipake
- Kalau baru pertama kali setup: klik source `ALERTS` → klik **"Refresh cache of current page"**
- Cek file meme ada di folder `public/memes/`

### ❌ Overlay ticker tidak muncul
- Pastiin source `ticker` ada di scene yang lagi dipake
- Kalau baru pertama kali setup: klik source `ticker` → klik **"Refresh cache of current page"**

### ❌ HP tidak bisa buka stream deck
- Pastiin HP dan laptop konek ke **WiFi yang sama**
- Buka browser HP, ketik URL yang muncul di terminal: `http://[IP]:4321`

### ❌ IP berubah tiap ganti WiFi
- Normal! Tinggal jalanin `START.bat` lagi — IP otomatis terupdate

### ❌ Meme muncul sendiri saat pindah scene
- Sudah diatasi — meme hanya muncul sekali setelah diklik, tidak akan muncul lagi walau scene di-refresh

---

## 📝 Catatan
- Data meme tersimpan di `src/data/memes.json` — backup file ini kalau mau pindah laptop
- File meme (video/gif) tersimpan di `public/memes/` — backup folder ini juga
- Teks ticker tersimpan di browser HP via localStorage — kalau ganti HP perlu ketik ulang

Web app ini awalnya dibuat untuk coba-coba framework astro dari node.js. Melihat performanya yang cepat, saya memutuskan untuk menyempurnakannya dengan bantuan claude.ai untuk membuat fitur-fitur dan mengatasi error yang terjadi selama pembuatan. Jika ada bug ataupun error bisa menghubungi via email. Selamat mencoba dan semoga membantu bagi kalian yang ingin memiliki streamdeck namun belum dapat membelinya. 
Salam semi vibe-coder HAHA