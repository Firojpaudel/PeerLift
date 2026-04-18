# Deployment & Architecture Guide: PeerLift

This guide explains how to properly deploy our dual-architecture setup, incorporating Next.js (Frontend & DB), Neon (Serverless Postgres), and FastRTC (Real-time Audio/Video).

## 1. Database (Neon Serverless Postgres)

Neon is excellent for Next.js Serverless deployments because it handles connection pooling automatically, preventing Vercel functions from exhausting DB connections.

### Setup Steps:

1. Create an account at [neon.tech](https://neon.tech).
2. Create a new project (e.g., `peerlift-db`).
3. Copy the **Pooled Connection String** (it usually has `...-pooler.region.aws.neon.tech/...`).
4. Update your `.env.local` to use this connection string:
   \`\`\`env
   DATABASE_URL="postgresql://user:password@ep-pooler...neon.tech/peerlift?sslmode=require"
   \`\`\`
5. Push the schema using Prisma:
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   \`\`\`

## 2. Frontend & AI (Vercel)

Vercel is the natural host for Next.js. It perfectly powers our `/api/chat` Groq-streaming route using Edge or Serverless Functions.

### Setup Steps:

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com), click **Add New Project**, and import the repository.
3. In the Environment Variables section during configuration, add:
   - `DATABASE_URL` (Neon Pooled Connection String)
   - `NEXTAUTH_SECRET` (Run \`openssl rand -base64 32\` in terminal to generate)
   - `NEXTAUTH_URL` (The temporary Vercel URL, update later)
   - `GROQ_API_KEY` (From console.groq.com)
4. Click **Deploy**. Vercel will automatically run \`npm run build\`.

## 3. Real-Time Communication (FastRTC)

Next.js is **not** designed for long-running WebSocket or WebRTC connections because Vercel functions time out after ~10-60 seconds. Therefore, we use **FastRTC** (a Python library built on WebRTC) as a separate microservice.

### Setup Steps:

1. Create a separate folder/repo for your Python backend (e.g., `fastrtc-backend`).
2. **Install FastRTC**:
   \`\`\`bash
   pip install fastrtc fastapi uvicorn
   \`\`\`
3. **Basic Python Script (\`main.py\`)**:
   \`\`\`python
   from fastrtc import ReplyOnPause, Stream
   from fastapi import FastAPI

   app = FastAPI()

   # Example: Simple echo or AI bridging logic

   stream = Stream(ReplyOnPause(my_audio_handler), modality="audio")

   # Mount fastRTC endpoints to FastAPI

   stream.mount(app)
   \`\`\`

4. **Deploy to a Long-running Host**:
   - **Render** or **Railway**: These platforms support Docker and long-running Python processes unlike Vercel.
   - Simply connect your Python repo to Render/Railway.
5. **Connect Next.js to FastRTC**:
   In your PeerLift Chat UI (\`sessions/chat/page.tsx\`), when a user clicks the **Mic** or **Video** buttons, initialize the FastRTC Web Component using the URL of your Render/Railway backend.

### Summary of Architecture

- **Web App + Auth + DB + Chat UI:** Next.js hosted on Vercel.
- **Database:** Postgres hosted on Neon (Serverless connection pooling).
- **AI Sensei:** Vercel serverless function (`/api/chat`) proxying to Groq API.
- **Live Video / Voice:** FastRTC python server hosted on Render/Railway.
