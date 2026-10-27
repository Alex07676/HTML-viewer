# HTML-visaren

Ladda upp HTML-filer och se dem direkt i webbläsaren. Körs som en Cloudflare Worker.

## Filer
- `worker.js` – själva sidan, serveras av Workern
- `wrangler.toml` – Cloudflare-inställningar (namnet måste vara `html-visare`)

## Deploy
Koppla repot i Cloudflare under Workers & Pages. Eller kör `npx wrangler deploy`.
