# Railway Deployment

## Steps
1. Go to railway.app → New Project → Deploy from GitHub
2. Select this repo
3. Railway auto-detects Node.js and runs `npm start`
4. Settings → Networking → Generate Domain → get your public URL

## Environment variables (none required for demo)
For production add:
- DATABASE_URL (PostgreSQL)
- NEXTAUTH_SECRET
- NEXTAUTH_URL

## The app runs on PORT (set automatically by Railway)
