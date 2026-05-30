# Deploying PeerLift to Vercel

This project is designed to run on Vercel (Next.js + Vercel AI SDK). The repository contains a GitHub Actions workflow that will deploy the app to Vercel on pushes to `main` once you add the required secrets.

Steps to enable automated deploys:

1. Create a Vercel account and import this repository (or link an existing project).

2. Create a Vercel Personal Token:

   - Visit https://vercel.com/account/tokens and create a token.
   - Save the token value.

3. Find your Vercel Org & Project IDs (optional but recommended):

   - In Vercel, open your project → Settings → General → Project ID.
   - For org ID: Vercel dashboard → Settings → General → Organization ID.

4. Add GitHub repository secrets (Repository → Settings → Secrets → Actions):

   - `VERCEL_TOKEN` — the token you created
   - `VERCEL_ORG_ID` — (optional) organization id
   - `VERCEL_PROJECT_ID` — (optional) project id
   - Also add any env vars used by the build (e.g. `DATABASE_URL`, `NEXTAUTH_SECRET`, `GROQ_API_KEY`, `PUSHER_*`)

5. Once secrets are set, push to `main`. The workflow `.github/workflows/deploy.yml` will:

   - Install dependencies
   - Build the app (`npm run build`)
   - Invoke the Vercel Action to deploy to production (`--prod`)

Manual deploy with Vercel CLI (alternative):

1. Install the Vercel CLI and login locally:

```bash
npm i -g vercel
npx vercel login
```

2. From the repo root, link the project (follow prompts) and deploy:

```bash
npx vercel link
npx vercel --prod
```

Notes & troubleshooting:

- If you prefer Vercel's Git integration (recommended), you can simply import the repo in Vercel and it will handle deployments automatically without the Action; still add required environment variables in the Vercel project settings.
- The GitHub Action requires the `VERCEL_TOKEN` secret. Without it the Action will fail to deploy.
- I can help create the `VERCEL_TOKEN` and update GitHub secrets if you grant the token here (not recommended for security). Safer: create secrets yourself in GitHub and I can run checks locally.
