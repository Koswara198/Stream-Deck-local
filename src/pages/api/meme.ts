// src/pages/api/meme.ts
// Simpan state meme terakhir di memory (reset kalau server restart)
let lastMeme: { file: string; type: string; t: number } | null = null;

export const prerender = false;

// ini get
export async function GET() {
  return new Response(JSON.stringify(lastMeme ?? { file: null, type: null, t: 0 }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    }
  });
}

// ini post
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
