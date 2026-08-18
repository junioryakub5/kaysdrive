# KAYSDRIVE Backend – Deployment Guide

This guide covers deploying the backend on a **Hostinger VPS** (or any Linux VPS) with **Supabase** as the database.

---

## 1. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → Create free account → **New project**
2. Once ready, go to **Project Settings → Database → Connection string**
3. Copy the two URLs:
   - **Transaction** mode (port `6543`) → `DATABASE_URL`
   - **Session** mode (port `5432`) → `DIRECT_URL`

---

## 2. Configure Environment Variables

In the `backend/` folder, copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="your-secure-random-string"
JWT_EXPIRES_IN="24h"
PORT=3001
NODE_ENV="production"
CORS_ORIGIN="https://your-frontend-domain.com"
```

---

## 3. Run Database Migrations

Run once after setting up `.env`:

```bash
cd backend
npm install
npm run db:migrate:deploy   # Push schema to Supabase
npm run seed                # Seed initial data (optional)
```

---

## 4. Deploy on Hostinger VPS

### Install dependencies on VPS

```bash
# Node.js (using NVM)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20

# PM2 (process manager)
npm install -g pm2

# Nginx
sudo apt update && sudo apt install -y nginx
```

### Upload & build

```bash
# On your local machine — upload backend to VPS
scp -r ./backend user@your-vps-ip:/var/www/kaysdrive/

# On VPS
cd /var/www/kaysdrive/backend
npm install
npm run build
```

### Start with PM2

```bash
pm2 start dist/index.js --name kaysdrive-backend
pm2 save
pm2 startup   # Auto-start on reboot
```

### Nginx reverse proxy

Create `/etc/nginx/sites-available/kaysdrive`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/kaysdrive /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### HTTPS (optional but recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## 5. Update Frontend

Set the backend URL in your frontend `.env`:

```env
VITE_API_URL=https://api.yourdomain.com
```

---

## Quick Reference

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |
| `npm run db:migrate:deploy` | Run Prisma migrations on Supabase |
| `npm run seed` | Seed database with initial data |
| `npm run db:studio` | Open Prisma Studio GUI |
