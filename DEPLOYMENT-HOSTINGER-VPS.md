# Hostinger VPS Production Deployment Guide

This project is a Vite + React application using Supabase client-side integration.

## What this guide covers

- Preparing a Hostinger VPS for production
- Installing Node.js and dependencies
- Building the project for production
- Serving the production build with Nginx
- Configuring client-side routing with `react-router-dom`
- Managing Supabase environment variables

---

## 1. Project overview

Key details from this repo:

- `package.json` scripts:
  - `npm run build` → builds production assets to `dist`
  - `npm run preview` → local preview server (not for production)
- Uses Vite + React
- Uses `BrowserRouter` from `react-router-dom`
- Uses Supabase client via `src/integrations/supabase/client.ts`
- Production build outputs live static files in `dist`

---

## 2. Pre-requisites on Hostinger VPS

1. SSH access to the VPS.
2. A modern Node.js version installed (Node 20.x or newer recommended).
3. Nginx installed for serving static files.
4. Git access to clone the repo, or SCP/FTP upload.
5. If you want package manager parity, install `pnpm`; otherwise `npm` works.

---

## 3. VPS setup (Ubuntu/Debian example)

### Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y nodejs
node -v
npm -v
```

### Install `pnpm` (optional, recommended if you use `pnpm-lock.yaml`)

```bash
npm install -g pnpm
pnpm -v
```

### Install Nginx

```bash
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 4. Clone the repo and install dependencies

```bash
cd /var/www
sudo mkdir -p deemmedical
sudo chown "$(whoami):$(whoami)" deemmedical
cd deemmedical
# Clone directly into /var/www/deemmedical, not into an extra nested subfolder.
git clone <your-repo-url> .
```

Install dependencies:

```bash
# Preferred if pnpm is available
pnpm install

# Or fallback to npm
npm install
```

> If your repo includes `.env` locally, do not commit it to Git. Use a VPS-only `.env` file or a secure secret management approach.

---

## 5. Configure environment variables

This app uses build-time Vite env variables. The production build needs:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Create a `.env.production` or `.env` file in the repository root:

```bash
cat > .env.production <<'EOF'
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
EOF
```

> Do not store secret service keys or server-side secrets in `VITE_` variables. Only publishable Supabase keys belong in the frontend bundle.

If you keep `.env` in the repo, add it to `.gitignore`:

```text
.env
.env.*
```

---

## 6. Build for production

Run:

```bash
npm run build
```

Or with pnpm:

```bash
pnpm run build
```

This creates static assets in `dist`.

---

## 7. Serve the production build with Nginx

### Nginx server block

Create or update `/etc/nginx/sites-available/deemmedical`:

```nginx
server {
  listen 80;
  server_name your-domain.com;

  root /var/www/deemmedical/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(?:css|js|json|svg|png|jpg|jpeg|gif|ico|webp|avif)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
}
```

Enable the site:

```bash
sudo ln -sf /etc/nginx/sites-available/deemmedical /etc/nginx/sites-enabled/deemmedical
sudo nginx -t
sudo systemctl reload nginx
```

### Why this works

- `dist` is the Vite production output.
- `try_files $uri $uri/ /index.html` ensures React Router fallback works for client-side routes.
- Static asset caching improves performance.

---

## 8. Optional: enable HTTPS

Install Certbot and request a certificate:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d deem-ksa.com
```

Follow Certbot prompts and confirm auto-renewal.

---

## 9. Deployment workflow for updates

When you update code, repeat:

1. `git pull` or upload updated files
2. `npm install` / `pnpm install` if dependencies changed
3. `npm run build`
4. `sudo systemctl reload nginx`

If you need a quick local production check on the VPS:

```bash
npm run preview
```

> `npm run preview` is only for testing; do not use it as the long-term production server.

---

## 10. Troubleshooting

- `502 Bad Gateway` or blank page: verify Nginx root points to `/var/www/deemmedical/dist`.
- `404 on deep links`: make sure `try_files ... /index.html` is present.
- Build fails: confirm Node version is `>=20` and dependencies are installed.
- Supabase client fails: confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are correct and rebuilt.

---

## 11. Notes specific to this repo

- `src/App.tsx` uses `BrowserRouter`, so SPA fallback is required.
- `src/integrations/supabase/client.ts` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` at build time.
- The production site is static, so there is no Node backend required for serving the app.

---

## 12. Quick check

After deployment, open your browser and visit:

- `https://your-domain.com`
- `https://your-domain.com/products`
- `https://your-domain.com/admin`

If all routes work and there are no console errors, deployment is complete.
