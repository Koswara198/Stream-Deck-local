// src/pages/api/memes.ts
import fs from 'node:fs';
import path from 'node:path';
export const prerender = false;

interface Meme {
  id: string;
  label: string;
  file: string;
  type: 'video' | 'image';
  color: string;
}

const COLORS = ['#ff4b2b','#00d4ff','#00ff88','#ffcc00','#ff00ff','#ffaa00','#a855f7','#ec4899','#06b6d4','#84cc16'];
const DB_PATH = path.resolve('./src/data/memes.json');

function readMemes(): Meme[] {
  try {
    if (!fs.existsSync(DB_PATH)) return [];
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function writeMemes(memes: Meme[]) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(memes, null, 2), 'utf-8');
}

export async function GET() {
  return new Response(JSON.stringify(readMemes()), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    }
  });
}

export async function POST({ request }: { request: Request }) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File;
    const label = data.get('label') as string;
    const type = data.get('type') as 'video' | 'image';

    if (!file) return new Response(JSON.stringify({ ok: false }), { status: 400 });

    // Simpan file fisik ke public/memes
    const memesDir = path.resolve('./public/memes');
    if (!fs.existsSync(memesDir)) fs.mkdirSync(memesDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(memesDir, file.name), buffer);

    // Tambah ke JSON
    const memes = readMemes();
    const newMeme: Meme = {
      id: 'm_' + Date.now(),
      label,
      file: file.name,
      type,
      color: COLORS[memes.length % COLORS.length],
    };
    memes.unshift(newMeme);
    writeMemes(memes);

    return new Response(JSON.stringify({ ok: true, meme: newMeme }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 500 });
  }
}

export async function DELETE({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const memes = readMemes();
    const memeToDelete = memes.find(m => m.id === body.id);

    if (memeToDelete) {
      // Hapus file fisik
      const filePath = path.resolve('./public/memes', memeToDelete.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ File ${memeToDelete.file} dihapus`);
      }
      // Update JSON
      writeMemes(memes.filter(m => m.id !== body.id));
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 500 });
  }
}