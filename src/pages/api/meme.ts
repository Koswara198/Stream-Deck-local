// src/pages/api/meme.ts
let lastMeme: { file: string; type: string; t: number } | null = null;

export const prerender = false;

export async function GET() {
  const response = JSON.stringify(lastMeme ?? { file: null, type: null, t: 0 });
  // Reset setelah dibaca — biar ga muncul lagi kalau browser source di-refresh
  lastMeme = null;
  return new Response(response, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    }
  });
}

export async function POST({ request }: { request: Request }) {
  const body = await request.json();
  lastMeme = { file: body.file, type: body.type, t: Date.now() };
  console.log('[API] Meme set:', lastMeme);
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}