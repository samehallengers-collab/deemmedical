import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { texts, target } = await req.json();
    if (!Array.isArray(texts) || !texts.length || !target) {
      return new Response(JSON.stringify({ error: 'invalid input' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const key = Deno.env.get('LOVABLE_API_KEY');
    if (!key) return new Response(JSON.stringify({ error: 'missing key' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const targetName = target === 'ar' ? 'Arabic' : 'English';
    const numbered = texts.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n');
    const prompt = `Translate each of the following items into ${targetName}. Return ONLY a JSON array of strings, in the same order, with the same length (${texts.length}). Preserve product/brand names. No commentary.\n\n${numbered}`;

    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': key },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are a professional translator. Output valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: 'gateway error', detail: errText }), { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? '[]';
    let translations: string[] = [];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) translations = parsed;
      else if (Array.isArray(parsed.translations)) translations = parsed.translations;
      else if (Array.isArray(parsed.items)) translations = parsed.items;
      else {
        const firstArr = Object.values(parsed).find((v) => Array.isArray(v));
        if (firstArr) translations = firstArr as string[];
      }
    } catch {
      translations = [];
    }
    if (translations.length !== texts.length) {
      // pad/trim to match
      translations = texts.map((t: string, i: number) => translations[i] ?? t);
    }
    return new Response(JSON.stringify({ translations }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});