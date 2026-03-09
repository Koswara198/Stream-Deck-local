// src/pages/api/ticker.ts
let tickerState: { text: string | null; active: boolean; t: number } = {
    text: null,
    active: false,
    t: 0
  };
  
  export const prerender = false;
  
  export async function GET() {
    return new Response(JSON.stringify(tickerState), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      }
    });
  }
  
  export async function POST({ request }: { request: Request }) {
    const body = await request.json();
    tickerState = {
      text: body.text ?? null,
      active: body.active ?? false,
      t: Date.now()
    };
    console.log('[TICKER] State set:', tickerState);
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }