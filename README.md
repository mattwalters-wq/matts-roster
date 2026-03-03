# Roster - Artist Management Hub

A kanban-style project management board built for managing your artist roster.

## Deploy to Vercel (free)

### Option A: Quick deploy (no Git needed)
1. Install Vercel CLI: `npm i -g vercel`
2. Unzip this project
3. In the project folder, run: `npm install`
4. Run: `vercel`
5. Follow the prompts - done! You'll get a live URL.

### Option B: Via GitHub
1. Create a new GitHub repo
2. Push this project to it
3. Go to [vercel.com](https://vercel.com) and sign in with GitHub
4. Click "Import Project" and select your repo
5. It auto-detects Vite - just click Deploy

## Local development
```
npm install
npm run dev
```

## Notes
- Data is stored in your browser's localStorage
- Data persists on the same browser/device
- To start fresh, clear localStorage or open browser dev tools > Application > Local Storage > delete the `roster-hub-data` key
