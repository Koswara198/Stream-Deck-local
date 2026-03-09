# 🎮 Astro Stream Deck

Stream deck lokal berbasis web buat kontrol Streamlabs + trigger meme langsung dari HP.

---

## Stack

- **Astro** (SSR mode) — web server + UI
- **Streamlabs Desktop** — target OBS-based streaming app
- **Browser Source** di Streamlabs — buat nampilin meme overlay

---

## Struktur File

```
src/pages/
├── index.astro        # Halaman utama stream deck (ganti scene, dll)
├── meme.astro         # Meme board — tombol-tombol trigger meme
├── display.astro      # Halaman overlay yang dipasang di Streamlabs browser source
└── api/
    └── meme.ts        # API endpoint — jembatan antara meme board & display
```

---

## Cara Kerja

```
[HP: klik tombol meme]
        ↓
POST /api/meme  →  server simpan { file, type, timestamp } di memory
                                        ↑
[display.astro di Streamlabs]  ←── polling /api/meme tiap 1 detik
                                    kalau timestamp baru → play meme
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Pastikan `astro.config.mjs` pakai SSR + node adapter

```js
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: { host: true, port: 4321 },
  preview: { host: true, port: 4321 },
});
```

### 3. Jalankan dev server

```bash
npm run dev -- --host
```

### 4. Setup Browser Source di Streamlabs

- Tambah **Browser Source** baru, kasih nama `ALERTS`
- URL: `http://192.168.100.70:4321/display`
- Width/Height sesuaikan dengan resolusi stream
- Centang **"Shutdown source when not visible"** → OFF
- Centang **"Refresh browser when scene becomes active"** → optional

### 5. Akses Stream Deck dari HP

Buka browser di HP, akses:
```
http://192.168.100.70:4321
```

---

## Nambahin Meme Baru

Edit array `memes` di `src/pages/meme.astro`:

```js
const memes = [
  { id: 'm1', label: '😂 BRUH', file: 'BRUH.mp4', type: 'video', color: '#ff4b2b' },
  { id: 'm2', label: '😲 WOW',  file: 'wow.gif',  type: 'image', color: '#00d4ff' },
  // tambah di sini:
  { id: 'm3', label: '💀 DEAD', file: 'dead.mp4', type: 'video', color: '#9b59b6' },
];
```

Taruh file meme (`.mp4`, `.gif`, `.jpg`, dll) di folder:
```
public/memes/
```

---

## Troubleshooting

| Problem | Solusi |
|---|---|
| API `/api/meme` return 404 | Pastikan `output: 'server'` ada di `astro.config.mjs` dan nama file adalah `meme.ts` bukan `meme-api.ts` |
| Meme ga muncul di Streamlabs | Klik sekali di halaman `display` buat unlock autoplay browser |
| Tombol meme ga respons | Cek console browser — pastikan fetch ke `/api/meme` berhasil (status 200) |
| Ga bisa diakses dari HP | Jalankan dengan flag `--host`: `npm run dev -- --host` |
| Video ga bunyi | Browser source Streamlabs perlu "interact" dulu — klik kanan source → Interact, lalu klik halaman display-nya |

---

## IP & Config

Ganti IP sesuai PC lo di file-file berikut kalau pindah jaringan:

- `src/pages/meme.astro` — baris `fetch('http://192.168.100.70:4321/api/meme')`
- `src/pages/display.astro` — baris IP di fungsi `playMeme`
- `src/pages/index.astro` — baris `const IP_PC`
"# Stream-Deck-local" 
