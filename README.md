# PeerLift: Peer-to-Peer Skill Exchange Platform

_Trade skills. Grow together._

Eliminate financial barriers to learning through peer collaboration. PeerLift is a warm, trustworthy, empowering, and community-first application designed to help users exchange their skills directly with one another.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand
- **Backend:** Node.js, Next.js API Routes, NextAuth (Auth.js v5), Prisma, PostgreSQL
- **Real-time:** Socket.io, Redis (Upstash)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Configure your environment variables inside an `.env` file (copy `.env.example` if available).
Then, setup the Prisma Database:

```bash
npx prisma generate
npx prisma db push # or npx prisma migrate dev
```

Finally, start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
