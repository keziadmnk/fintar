// Follow Supabase Edge Functions standard HTTP handler format (Deno / Node compatible)
import { getActiveProvider, getProviderConfig } from '../_shared/llm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function handleLlmStatusRequest(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const activeProvider = getActiveProvider();
    const config = getProviderConfig();

    const statusResponse = {
      status: 'healthy',
      provider: activeProvider,
      model: config.model,
      configured: activeProvider === 'mock' ? true : Boolean(config.apiKey),
      timestamp: new Date().toISOString(),
      capabilities: {
        ocrReceiptParsing: true,
        toolCalling: true,
        structuredOutputs: true,
      },
    };

    return new Response(JSON.stringify(statusResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Internal error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}

// Supabase Edge Function default export listener
if (typeof (globalThis as any).Deno !== 'undefined') {
  (globalThis as any).Deno.serve(handleLlmStatusRequest);
}
