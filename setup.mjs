// setup.mjs — jalanin sekali sebelum npm run dev
import { networkInterfaces } from 'os';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const WebSocket = require('ws');

function getLocalIP() {
  const nets = networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        candidates.push({ name, address: net.address });
      }
    }
  }
  if (candidates.length === 0) return null;
  const preferred = candidates.find(c => c.address.startsWith('192.168.'));
  return preferred || candidates[0];
}

function getCurrentEnv() {
  if (!existsSync('.env')) return {};
  const lines = readFileSync('.env', 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const [key, ...val] = line.split('=');
    if (key && val.length) env[key.trim()] = val.join('=').trim();
  }
  return env;
}

// ── 1. DETECT IP ──────────────────────────────────────
const ip = getLocalIP();
if (!ip) {
  console.error('❌ Tidak bisa detect IP. Pastiin lo konek ke jaringan!');
  process.exit(1);
}
console.log(`✅ IP terdeteksi: ${ip.address} (via ${ip.name})`);

// ── 2. CEK / BUAT .ENV ────────────────────────────────
const existing = getCurrentEnv();

if (!existsSync('.env') || !existing.PUBLIC_API_KEY || existing.PUBLIC_API_KEY === 'ISI_TOKEN_STREAMLABS_DI_SINI') {
  console.log('');
  console.log('⚠️  File .env belum ada atau API Token belum diisi!');
  console.log('');
  console.log('Cara ambil API Token Streamlabs:');
  console.log('  1. Buka Streamlabs');
  console.log('  2. Klik ikon ⚙️  Settings (kiri bawah)');
  console.log('  3. Pilih Remote Control');
  console.log('  4. Copy token yang ada di sana');
  console.log('');

  const defaultEnv = `PUBLIC_IP=${ip.address}
PUBLIC_PORT=59650
PUBLIC_ASTRO_PORT=4321
PUBLIC_API_KEY=ISI_TOKEN_STREAMLABS_DI_SINI
IP=${ip.address}
PORT=59650
API_TOKEN=ISI_TOKEN_STREAMLABS_DI_SINI`;

  writeFileSync('.env', defaultEnv, 'utf-8');
  console.log('📝 File .env sudah dibuat. Isi token dulu lalu jalanin START.bat lagi.');
  process.exit(1);
}

const newEnv = {
  ...existing,
  PUBLIC_IP: ip.address,
  PUBLIC_PORT: existing.PUBLIC_PORT || '59650',
  PUBLIC_ASTRO_PORT: existing.PUBLIC_ASTRO_PORT || '4321',
  PUBLIC_API_KEY: existing.PUBLIC_API_KEY || '',
  IP: ip.address,
  PORT: existing.PORT || '59650',
  API_TOKEN: existing.API_TOKEN || existing.PUBLIC_API_KEY || '',
};

writeFileSync('.env', Object.entries(newEnv).map(([k, v]) => `${k}=${v}`).join('\n'), 'utf-8');
console.log(`📝 .env diupdate → PUBLIC_IP=${newEnv.PUBLIC_IP}`);

// ── 2.5. MATIIN DEV TOOLBAR ───────────────────────────
try {
  execSync('npx astro preferences disable devToolbar', { stdio: 'ignore' });
} catch {}

// ── 3. DETECT PORT STREAMLABS ─────────────────────────
const STREAMLABS_PORTS = [59650, 59651, 59652, 59653, 59654, 59655];
const TOKEN = newEnv.PUBLIC_API_KEY;
const ASTRO_PORT = newEnv.PUBLIC_ASTRO_PORT || '4321';
const NEW_IP = ip.address;

const CACHE_BUST = Date.now();

const REQUIRED_SOURCES = [
  { name: 'ALERTS', url: `http://${NEW_IP}:${ASTRO_PORT}/display?v=${CACHE_BUST}`, width: 480, height: 480 },
  { name: 'ticker', url: `http://${NEW_IP}:${ASTRO_PORT}/ticker-display?v=${CACHE_BUST}`, width: 480, height: 60 },
];

async function detectStreamlabsPort() {
  return new Promise((resolve) => {
    let checked = 0;
    for (const port of STREAMLABS_PORTS) {
      const testWs = new WebSocket(`ws://localhost:${port}/api/websocket`);
      const t = setTimeout(() => { testWs.terminate(); checked++; if (checked === STREAMLABS_PORTS.length) resolve(null); }, 1500);
      testWs.on('open', () => { clearTimeout(t); testWs.close(); resolve(port); });
      testWs.on('error', () => { clearTimeout(t); checked++; if (checked === STREAMLABS_PORTS.length) resolve(null); });
    }
  });
}

console.log('\n🔍 Mencari port Streamlabs...');
const detectedPort = await detectStreamlabsPort();

if (!detectedPort) {
  console.log('⚠️  Streamlabs tidak bisa dikonek! Pastiin Streamlabs sudah dibuka.');
  console.log('\n🚀 Lanjut jalanin: npm run dev');
  process.exit(0);
}

console.log(`✅ Streamlabs ditemukan di port ${detectedPort}`);

if (String(detectedPort) !== String(newEnv.PUBLIC_PORT)) {
  newEnv.PUBLIC_PORT = String(detectedPort);
  newEnv.PORT = String(detectedPort);
  writeFileSync('.env', Object.entries(newEnv).map(([k, v]) => `${k}=${v}`).join('\n'), 'utf-8');
  console.log(`📝 Port diupdate → ${detectedPort}`);
}

// ── 4. KONEK & SETUP SOURCES ──────────────────────────
console.log('\n🔌 Konek ke Streamlabs...');

const ws = new WebSocket(`ws://localhost:${detectedPort}/api/websocket`);
let activeSceneId = null;
let knownSources = [];

const timeout = setTimeout(() => {
  console.log('⚠️  Koneksi timeout.');
  ws.terminate();
  process.exit(0);
}, 8000);

ws.on('open', () => {
  ws.send(JSON.stringify({
    jsonrpc: '2.0', id: 1,
    method: 'auth',
    params: { resource: 'TcpServerService', args: [TOKEN] }
  }));
});

ws.on('message', (raw) => {
  const data = JSON.parse(raw.toString());

  // id:1 — Auth
  if (data.id === 1) {
    if (data.error) {
      console.log('❌ Token Streamlabs salah — cek PUBLIC_API_KEY di .env');
      clearTimeout(timeout);
      ws.close();
      process.exit(1);
    }
    console.log('✅ Streamlabs authorized');
    ws.send(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'getSources', params: { resource: 'SourcesService' } }));
  }

  // id:2 — Get sources
  if (data.id === 2 && data.result) {
    knownSources = data.result;
    console.log('\n📋 Mengecek sources:');

    const missing = REQUIRED_SOURCES.filter(r => !knownSources.find(s => s.name === r.name));
    const found = REQUIRED_SOURCES.filter(r => knownSources.find(s => s.name === r.name));

    found.forEach(r => console.log(`   ✅ "${r.name}" ditemukan`));
    missing.forEach(r => console.log(`   ⚠️  "${r.name}" belum ada → akan dibuat otomatis`));

    if (missing.length > 0) {
      // Ambil active scene dulu
      ws.send(JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'activeScene', params: { resource: 'ScenesService' } }));
    } else {
      updateAllSources();
    }
  }

  // id:3 — Active scene
  if (data.id === 3 && data.result) {
    activeSceneId = data.result.id;
    console.log(`\n🎬 Scene aktif: ${data.result.name}`);
    console.log('🔧 Membuat sources yang belum ada...');

    const missing = REQUIRED_SOURCES.filter(r => !knownSources.find(s => s.name === r.name));
    missing.forEach((src, i) => {
      ws.send(JSON.stringify({
        jsonrpc: '2.0', id: 20 + i,
        method: 'createAndAddSource',
        params: {
          resource: 'ScenesService',
          args: [activeSceneId, src.name, 'browser_source', {
            url: src.url,
            width: src.width,
            height: src.height,
            is_local_file: false,
            shutdown: false,
            restart_when_active: true
          }]
        }
      }));
    });

    // Setelah bikin, refresh sources lalu update URL
    setTimeout(() => {
      ws.send(JSON.stringify({ jsonrpc: '2.0', id: 5, method: 'getSources', params: { resource: 'SourcesService' } }));
    }, 2000);
  }

  // id:5 — Get sources setelah bikin baru → refresh semua source
  if (data.id === 5 && data.result) {
    knownSources = data.result;
    console.log('🔄 Refresh browser sources...');
    REQUIRED_SOURCES.forEach(r => {
      const found = knownSources.find(s => s.name === r.name);
      if (found) {
        ws.send(JSON.stringify({
          jsonrpc: '2.0', id: 6,
          method: 'refresh',
          params: { resource: `Source["${found.sourceId}"]` }
        }));
        console.log(`   ✅ Refreshed "${r.name}"`);
      }
    });
    updateAllSources();
  }

  // id:20+ — Response createAndAddSource
  if (data.id >= 20 && data.id < 30) {
    const src = REQUIRED_SOURCES[data.id - 20];
    if (data.error) {
      console.log(`   ❌ Gagal buat "${src.name}": ${data.error.message}`);
    } else {
      console.log(`   ✅ Source "${src.name}" berhasil dibuat`);
    }
  }

  // id:10-19 — Response updateSettings
  if (data.id >= 10 && data.id < 20) {
    const src = REQUIRED_SOURCES[data.id - 10];
    if (data.error) {
      console.log(`   ❌ Gagal update "${src.name}": ${data.error.message}`);
    } else {
      console.log(`   ✅ "${src.name}" → ${src.url}`);
    }
    pending--;
    if (pending <= 0) finish();
  }
});

let pending = REQUIRED_SOURCES.length;

function updateAllSources() {
  console.log('\n🔄 Mengupdate URL browser sources...');
  pending = REQUIRED_SOURCES.length;
  REQUIRED_SOURCES.forEach((src, i) => {
    const found = knownSources.find(s => s.name === src.name);
    if (found) {
      ws.send(JSON.stringify({
        jsonrpc: '2.0', id: 10 + i,
        method: 'updateSettings',
        params: { resource: `Source["${found.sourceId}"]`, args: [{ url: src.url }] }
      }));
      // Refresh setelah update URL
      setTimeout(() => {
        ws.send(JSON.stringify({
          jsonrpc: '2.0', id: 90 + i,
          method: 'refresh',
          params: { resource: `Source["${found.sourceId}"]` }
        }));
      }, 500);
    } else {
      pending--;
      if (pending <= 0) finish();
    }
  });
}

function finish() {
  clearTimeout(timeout);
  console.log('\n🎉 Streamlabs siap!');
  console.log('💡 Kalau pertama kali setup: klik kanan source ALERTS & ticker di Streamlabs → Refresh');
  console.log('🚀 Sekarang jalanin: npm run dev');
  ws.close();
  process.exit(0);
}

ws.on('error', () => {
  clearTimeout(timeout);
  console.log('⚠️  Koneksi ke Streamlabs gagal.');
  console.log('\n🚀 Lanjut jalanin: npm run dev');
  process.exit(0);
});
