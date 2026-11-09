# HTML Viewer

Upload HTML files and view them directly in your browser. Runs as a Cloudflare Worker.

## Files
- `worker.js` - the page itself, served by the Worker
- `wrangler.toml` - Cloudflare settings (the name must be `html-visare`)

## Deployment
Connect the repository in Cloudflare under Workers & Pages, or run `npx wrangler deploy`.

## Credit
Made by Alex Ferneborg (https://alexswe.dpdns.org)