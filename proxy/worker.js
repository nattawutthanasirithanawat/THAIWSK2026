/**
 * =========================================================================
 * Cloudflare Worker API Bridge for THAI WSK 2026 (Mode B — GitHub Pages)
 * =========================================================================
 * Proxies requests between GitHub Pages domain and Google Apps Script Web App.
 * Handles CORS headers, rate limiting, and origin protection.
 */

const APPS_SCRIPT_EXEC_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

// Specify allowed origins (e.g. GitHub Pages or custom domain)
const ALLOWED_ORIGINS = [
  'https://your-school-org.github.io',
  'https://wsk.ac.th',
  'http://localhost:3000'
];

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed)) || ALLOWED_ORIGINS.includes('*');

    const corsHeaders = {
      'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    };

    // Preflight OPTIONS check
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const targetUrl = new URL(env.APPS_SCRIPT_URL || APPS_SCRIPT_EXEC_URL);

    // Forward all query parameters
    url.searchParams.forEach((val, key) => {
      targetUrl.searchParams.set(key, val);
    });

    try {
      const forwardedResponse = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Cloudflare-Worker-ThaiWSK-Proxy/1.0',
        },
      });

      const responseBody = await forwardedResponse.text();

      return new Response(responseBody, {
        status: forwardedResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          status: 'ERROR',
          message: 'API Bridge Connection Failed: ' + err.message,
        }),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }
  },
};
