# CLAUDE.md — PeerLift: Peer-to-Peer Skill Exchange Platform

> This file is the **single source of truth** for any AI agent building PeerLift.
> Read every section before writing a single line of code. Every decision here is intentional.

---

## 0. AGENT MINDSET

You are building a **production-grade, polished, real-world application**. Not a prototype. Not a demo. Every component must be:

- Fully typed (TypeScript strict mode)
- Accessible (WCAG 2.1 AA minimum)
- Responsive (mobile-first, tested at 320px, 768px, 1280px, 1440px)
- Performant (Core Web Vitals green)
- Consistent (design tokens everywhere, no magic values)
- Error-handled (every async call, every edge case)

When in doubt: **do the harder, more correct thing.** Shortcuts compound into technical debt.

---

## 1. PROJECT IDENTITY

| Field       | Value                                                               |
| ----------- | ------------------------------------------------------------------- |
| **Name**    | PeerLift                                                            |
| **Tagline** | _Trade skills. Grow together._                                      |
| **Mission** | Eliminate financial barriers to learning through peer collaboration |
| **Tone**    | Warm, trustworthy, empowering, human, community-first               |
| **NOT**     | Corporate, cold, gamified, transactional                            |

---

## 2. TECH STACK

### Frontend

```
Framework:     Next.js 14 (App Router, RSC-first)
Language:      TypeScript 5.x (strict: true, no exceptions)
Styling:       Tailwind CSS 3.x + CSS custom properties for design tokens
Animation:     Framer Motion 11.x
Icons:         Lucide React (never use emoji as icons in UI)
Forms:         React Hook Form + Zod validation
State:         Zustand (client state) + TanStack Query v5 (server state)
Date handling: date-fns (never moment.js)
Image upload:  react-dropzone → Cloudinary
Toasts:        Sonner
Skeleton:      Custom skeleton components (no third-party)
```

### Backend

```
Runtime:       Node.js 20 LTS
Framework:     Next.js API Routes (Route Handlers in App Router)
Auth:          Auth.js v5 (NextAuth) — credentials + OAuth (Google)
ORM:           Prisma 5.x
Database:      PostgreSQL 16 (primary data store)
Cache:         Redis (via Upstash) — sessions, rate limiting, pub/sub
Real-time:     Socket.io 4.x (for notifications + messaging)
File storage:  Cloudinary (images, avatars)
Email:         Resend (transactional emails)
Search:        PostgreSQL full-text search (tsvector) — no external service needed at v1
Background:    BullMQ + Redis (async jobs: email sending, match computation)
Validation:    Zod (shared between frontend and backend)
```

### Infrastructure

```
Hosting:       Vercel (frontend + API routes)
DB:            Supabase (managed PostgreSQL) or Railway
Redis:         Upstash (serverless Redis)
Storage:       Cloudinary (free tier sufficient for MVP)
CI/CD:         GitHub Actions
Env:           .env.local (never commit secrets)
```

### Developer Tooling

```
Linter:        ESLint + @typescript-eslint + eslint-plugin-tailwindcss
Formatter:     Prettier (single quotes, 2 spaces, trailing commas: 'all')
Git hooks:     Husky + lint-staged
Testing:       Vitest (unit) + Playwright (e2e)
Storybook:     For design system components
API testing:   Thunder Client or Bruno (never Postman)
```

---

## 3. DESIGN SYSTEM

### 3.1 Design Principle: WARM ORGANIC MODERNISM

PeerLift connects human beings. The interface must feel **alive, warm, and trustworthy**.

- **Warm** — Amber and terracotta primaries. No cold blues as primary brand color.
- **Organic** — Rounded corners everywhere. Soft shadows. Blob/organic background shapes.
- **Modern** — Clean whitespace. Sharp typographic hierarchy. No skeuomorphism.
- **Memorable** — One signature visual element per major page (not just boxes and text).

The emotional goal: When a user opens PeerLift, they feel they've arrived at a **warm community**, not a cold app.

---

### 3.2 Color Tokens

Define ALL colors as CSS custom properties in `globals.css`. **Never use raw hex in components.**

```css
:root {
  /* === PRIMARY: Warm Amber === */
  --color-primary-50: #fffbeb;
  --color-primary-100: #fef3c7;
  --color-primary-200: #fde68a;
  --color-primary-300: #fcd34d;
  --color-primary-400: #fbbf24;
  --color-primary-500: #f59e0b; /* Brand primary */
  --color-primary-600: #d97706;
  --color-primary-700: #b45309;
  --color-primary-800: #92400e;
  --color-primary-900: #78350f;

  /* === SECONDARY: Sage Green === */
  --color-secondary-50: #f0fdf4;
  --color-secondary-100: #dcfce7;
  --color-secondary-200: #bbf7d0;
  --color-secondary-300: #86efac;
  --color-secondary-400: #4ade80;
  --color-secondary-500: #22c55e; /* Brand secondary */
  --color-secondary-600: #16a34a;
  --color-secondary-700: #15803d;
  --color-secondary-800: #166534;
  --color-secondary-900: #14532d;

  /* === ACCENT: Terracotta === */
  --color-accent-400: #f87171;
  --color-accent-500: #ef4444; /* Destructive / alerts */
  --color-accent-terracotta: #c2714f; /* Decorative accent */

  /* === NEUTRALS: Warm Gray (NOT cool gray) === */
  --color-neutral-0: #ffffff;
  --color-neutral-50: #fafaf9; /* Page background */
  --color-neutral-100: #f5f5f4;
  --color-neutral-200: #e7e5e4;
  --color-neutral-300: #d6d3d1;
  --color-neutral-400: #a8a29e;
  --color-neutral-500: #78716c;
  --color-neutral-600: #57534e;
  --color-neutral-700: #44403c;
  --color-neutral-800: #292524;
  --color-neutral-900: #1c1917;

  /* === SEMANTIC === */
  --color-bg-primary: var(--color-neutral-50);
  --color-bg-secondary: var(--color-neutral-100);
  --color-bg-elevated: var(--color-neutral-0);
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
  --color-text-muted: var(--color-neutral-400);
  --color-border: var(--color-neutral-200);
  --color-border-strong: var(--color-neutral-300);

  /* === MATCH STATUS COLORS === */
  --color-match-direct: #22c55e; /* Perfect match — green */
  --color-match-partial: #f59e0b; /* Partial match — amber */
  --color-match-none: #a8a29e; /* No match — gray */

  /* === REQUEST STATUS === */
  --color-status-pending: #fbbf24;
  --color-status-accepted: #22c55e;
  --color-status-rejected: #ef4444;
  --color-status-counter: #8b5cf6;

  /* === SHADOWS === */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07);
  --shadow-md:
    0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07);
  --shadow-lg:
    0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07);
  --shadow-xl:
    0 20px 25px -5px rgb(0 0 0 / 0.07), 0 8px 10px -6px rgb(0 0 0 / 0.07);
  --shadow-glow-primary: 0 0 0 3px rgb(245 158 11 / 0.2);
  --shadow-glow-secondary: 0 0 0 3px rgb(34 197 94 / 0.2);

  /* === BORDER RADIUS === */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 32px;
  --radius-full: 9999px;

  /* === SPACING SCALE (8pt grid) === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* === TRANSITIONS === */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

### 3.3 Typography

```css
/* Import in layout.tsx */
/* Fonts: Bricolage Grotesque (display/headings) + Instrument Sans (body) */
/* Both from Google Fonts — beautiful, characterful, not overused */

:root {
  --font-display: 'Bricolage Grotesque', sans-serif;
  --font-body: 'Instrument Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace; /* for code/skill level tags */

  /* Type Scale (Major Third: 1.25x) */
  --text-xs: 0.75rem; /* 12px — metadata, badges */
  --text-sm: 0.875rem; /* 14px — secondary text, labels */
  --text-base: 1rem; /* 16px — body text */
  --text-lg: 1.125rem; /* 18px — lead text */
  --text-xl: 1.25rem; /* 20px — card titles */
  --text-2xl: 1.5rem; /* 24px — section headers */
  --text-3xl: 1.875rem; /* 30px — page titles */
  --text-4xl: 2.25rem; /* 36px — hero */
  --text-5xl: 3rem; /* 48px — hero large */
  --text-6xl: 3.75rem; /* 60px — marketing */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

**Typography Rules:**

- Display font (Bricolage Grotesque) for: H1, H2, H3, hero text, card titles, the PeerLift logo
- Body font (Instrument Sans) for: paragraphs, labels, buttons, metadata
- Mono font for: skill level badges, session count chips, any code-like content
- **Never** use bold body text for decoration — bold = semantic importance only
- Line length: 65–75 characters max for reading text (use `max-w-prose`)

---

### 3.4 Component Library Structure

Every component lives in `src/components/`. Organize strictly:

```
src/components/
├── ui/                    # Primitive, reusable, no business logic
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.variants.ts   # cva() variants
│   │   └── index.ts
│   ├── Avatar/
│   ├── Badge/
│   ├── Card/
│   ├── Dialog/
│   ├── Drawer/
│   ├── Input/
│   ├── Select/
│   ├── Skeleton/
│   ├── StarRating/
│   ├── Tag/               # Skill tags
│   ├── Textarea/
│   ├── Tooltip/
│   └── ...
├── layout/                # Layout wrappers
│   ├── Navbar/
│   ├── Sidebar/
│   ├── Footer/
│   └── PageWrapper/
├── features/              # Feature-specific composite components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── profile/
│   │   ├── ProfileCard.tsx
│   │   ├── ProfileHero.tsx
│   │   ├── SkillGrid.tsx
│   │   └── AvailabilityPicker.tsx
│   ├── skills/
│   │   ├── SkillSearchBar.tsx
│   │   ├── SkillCard.tsx
│   │   ├── SkillFilter.tsx
│   │   └── SkillBadge.tsx
│   ├── matching/
│   │   ├── MatchCard.tsx
│   │   ├── MatchBadge.tsx          # "Perfect Match", "Partial Match"
│   │   └── MatchList.tsx
│   ├── requests/
│   │   ├── RequestCard.tsx
│   │   ├── RequestForm.tsx
│   │   └── RequestStatusBadge.tsx
│   ├── sessions/
│   │   ├── SessionCard.tsx
│   │   └── SessionTimeline.tsx
│   ├── feedback/
│   │   ├── FeedbackForm.tsx
│   │   └── FeedbackCard.tsx
│   └── dashboard/
│       ├── StatsWidget.tsx
│       ├── ActivityFeed.tsx
│       └── QuickActions.tsx
└── shared/                # Shared across features
    ├── EmptyState.tsx
    ├── ErrorBoundary.tsx
    ├── LoadingSpinner.tsx
    └── PageHeader.tsx
```

---

### 3.5 Component Design Rules

**Button Variants (implement with `cva`):**

```
primary   — amber filled, white text, subtle scale on hover
secondary — white/transparent, amber border, amber text
ghost     — no border, warm-gray bg on hover
danger    — red/terracotta, for destructive actions
soft      — very light amber fill, amber text (for secondary CTAs in cards)
```

All buttons:

- Minimum touch target: 44px height
- Loading state: spinner replaces text (never disable without visual feedback)
- Disabled state: 40% opacity, `cursor-not-allowed`
- Focus ring: `--shadow-glow-primary` on focus-visible (keyboard nav)
- Transition: `var(--transition-base)` on all interactive properties

**Card Rules:**

- Background: `var(--color-bg-elevated)` — white on warm-gray page
- Border: `1px solid var(--color-border)`
- Border-radius: `var(--radius-lg)` default, `var(--radius-xl)` for feature cards
- Shadow: `var(--shadow-sm)` default, `var(--shadow-md)` on hover
- Hover: `translateY(-2px)` + shadow elevation
- Never nest cards (card inside card = wrong abstraction)

**Skill Tag/Badge:**

- Pill shape (`border-radius: var(--radius-full)`)
- Category-colored background (tinted):
  - Technical: soft blue tint
  - Creative: soft purple tint
  - Academic: soft amber tint
  - Sports/Physical: soft green tint
  - Language: soft pink tint
- Level indicator dot (Beginner=green, Intermediate=amber, Advanced=red) prepended
- Monospace font for consistency

---

### 3.6 Page-Level Design Specifications

#### LANDING PAGE (`/`)

**Hero Section:**

- Full viewport height
- Background: Large organic blob shapes in `primary-100` and `secondary-100` — positioned absolutely behind content using CSS `clip-path` or SVG
- Headline: "Trade Skills. Grow Together." — Bricolage Grotesque, 60px, font-weight 800
- Subheadline: 20px, neutral-600, max 2 lines
- Two CTAs: `primary` button ("Get Started — It's Free") + `ghost` button ("See How It Works")
- Right side: Animated skill exchange illustration — two floating cards ("I teach Python" ↔ "I teach Guitar") with an animated swap arrow. Use Framer Motion for floating/breathing animation.
- Statistics bar below hero: "2,400+ Skills Listed • 1,800+ Sessions Completed • 500+ Active Learners" — separated by amber dots

**How It Works Section:**

- 3-step visual flow with large numbered icons (1, 2, 3 in amber circles)
- Steps: "List your skills" → "Get matched" → "Exchange & grow"
- Subtle connecting line/arrow between steps
- Each step has an illustration/icon, not a stock photo

**Featured Skills Section:**

- Horizontally scrollable pill/tag cloud of popular skills — each clickable
- Gentle auto-scroll animation (CSS marquee or Framer)

**Testimonials/Social Proof:**

- 3 cards in a grid
- Avatar, name, skill exchanged, quote
- Star rating displayed

**CTA Banner:**

- Full-width warm amber gradient background
- "Ready to start learning?" headline
- Single CTA button

#### EXPLORE PAGE (`/explore`)

**Layout:**

- Left sidebar (280px, sticky): Filters (category checkboxes, level radio, availability day-picker)
- Right main (flexible): Search bar pinned at top, results grid below
- Mobile: Filters in a bottom drawer triggered by "Filter" button

**Search Bar:**

- Large, prominent, 48px height
- Placeholder: "Search for Python, Guitar, French..."
- Search icon (amber) on left, clear button on right
- Debounced 300ms — no button required
- URL-synced (query params update on search — shareable URLs)

**Skill Cards (in grid):**

- 2 columns on tablet, 3 on desktop
- Each card shows: Avatar, Name, Skill offered (large badge), Skills wanted (smaller badges, max 3 shown), Availability dots (green=available, gray=busy), Match status badge if logged in, "View Profile" CTA
- Match badge must be instantly recognizable:
  - 🟢 "Perfect Match" — green pill with sparkle icon
  - 🟡 "Partial Match" — amber pill with half-star icon
  - No badge if not logged in

**Filter Sidebar:**

- Section: Skill Category (checkboxes with colored dots)
- Section: Skill Level (radio: Any / Beginner / Intermediate / Advanced)
- Section: Availability (checkboxes for days of week)
- Section: Match Type (All / Perfect / Partial) — only shown when logged in
- "Clear all filters" text button at top
- Active filter count badge on mobile trigger button

#### USER PROFILE PAGE (`/u/[username]`)

**Profile Hero:**

- Full-width banner — soft gradient or subtle pattern (user can upload custom, default = generated from username hash → deterministic warm gradient)
- Avatar overlapping bottom of banner (large, 96px, ring in amber)
- Name (display font, 28px), @username (muted), location (optional)
- Bio (max 160 chars, shown fully, no truncation)
- Stats row: "12 Skills Taught • 8 Sessions • 4.8 ⭐"
- Action buttons (shown to visitors): "Send Request", "Message" (future), "Save Profile"
- Edit button (shown to owner)

**Skills Section (two columns):**

- Left column: "Skills I Teach" — skill cards with category badge + level
- Right column: "Skills I Want to Learn" — skill cards with "seeking" styling (dashed border)

**Availability Section:**

- 7-day week grid, each day showing time slots as colored blocks
- Green = available, transparent = not available
- Hover on block shows exact time ("Tues 6–8pm")

**Reviews Section:**

- List of feedback cards: reviewer avatar, name, skill exchanged, text, star rating, date
- Average rating shown prominently as a donut/arc visual + number

#### DASHBOARD (`/dashboard`)

**Layout:**

- 12-column grid
- Top: Welcome banner — "Good morning, [Name]. You have 3 pending requests."
- Left (8 cols): Main content area
- Right (4 cols): Sidebar with quick stats + upcoming sessions

**Widgets:**

1. **Pending Requests** — card list, each with accept/reject/counter inline actions
2. **Upcoming Sessions** — timeline view, next 3 sessions, countdown badge
3. **My Skills** — compact skill tags, "Add Skill" quick-add button
4. **Recent Activity Feed** — timestamped list (request received, session completed, review left)
5. **Stats Card** — animated counter numbers: sessions taught, sessions learned, avg rating

**Quick Actions Bar:**

- "Post a Skill" | "Browse Matches" | "View Requests" — large tappable tiles with icons

#### REQUEST MANAGEMENT (`/requests`)

**Tabs:**

- Received | Sent | Archived

**Each request card shows:**

- From user (avatar, name)
- Skill offered ↔ Skill requested (visual swap layout with arrow)
- Message preview (truncated to 2 lines, expand on click)
- Sent date + time ago
- Status badge
- Action buttons (Received: Accept / Reject / Counter | Sent: Withdraw | Archived: Reopen)

**Counter-offer flow:**

- Opens a modal/drawer
- Pre-fills original request
- User can modify "Skill offered" and add a new message
- Clear "This is a counter-offer" label

#### SESSION SCHEDULING (`/sessions`)

**Calendar View:**

- Week view (default), switchable to day/month
- Each session = colored block on calendar
- Color coded: Green = confirmed, Amber = pending confirmation, Red = cancelled
- Click session = popover with details + "Join Session" button (links to external tool)
- "Schedule New Session" button opens date/time picker

**Session Detail Page (`/sessions/[id]`):**

- Participants (both avatars + names)
- Skills being exchanged
- Date/Time (with timezone shown)
- Status
- Notes/agenda area (editable before session)
- After session: "Leave Review" CTA (prominent, with deadline shown "3 days left to review")

#### AUTH PAGES (`/login`, `/register`)

**Layout:**

- Split screen: Left = form, Right = decorative panel
- Right panel: Large background pattern + rotating testimonial cards + PeerLift brand tagline
- Mobile: Form only (decorative panel hidden)

**Register multi-step flow (3 steps, progress bar shown):**

1. Account details (email, password, confirm password)
2. Profile basics (name, username, bio, avatar upload, location)
3. Skills setup (Add "I can teach" + "I want to learn" — at least 1 each required to proceed)

Step 3 is the most important onboarding step — it directly feeds the matching algorithm. Make it delightful:

- Large "Add Skill" button that opens an inline skill picker
- Skill picker has category tabs + search
- Selected skills appear as animated tags below
- Helpful hint: "Add at least 1 skill to teach and 1 to learn to get matched"

---

## 4. DATABASE SCHEMA

Use Prisma. Every table has `createdAt` and `updatedAt`. Use UUIDs as primary keys.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  emailVerified DateTime?
  username      String    @unique
  passwordHash  String?   // null for OAuth users
  name          String
  bio           String?   @db.VarChar(160)
  avatarUrl     String?
  location      String?
  isAdmin       Boolean   @default(false)
  isBanned      Boolean   @default(false)
  banReason     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts        Account[]
  sessions        AuthSession[]
  skillsOffered   UserSkill[]       @relation("SkillsOffered")
  skillsWanted    UserSkill[]       @relation("SkillsWanted")
  availability    Availability[]
  requestsSent    ExchangeRequest[] @relation("RequestSender")
  requestsReceived ExchangeRequest[] @relation("RequestReceiver")
  sessionsAsLearner Session[]       @relation("SessionLearner")
  sessionsAsMentor  Session[]       @relation("SessionMentor")
  reviewsGiven    Review[]          @relation("ReviewGiver")
  reviewsReceived Review[]          @relation("ReviewReceiver")
  notifications   Notification[]
  reports         Report[]

  // Computed / denormalized for performance
  avgRating       Float     @default(0)
  totalSessions   Int       @default(0)
  totalReviews    Int       @default(0)

  // Full text search vector (auto-updated via trigger)
  searchVector    Unsupported("tsvector")?

  @@index([username])
  @@index([email])
  @@map("users")
}

model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model AuthSession {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("auth_sessions")
}

model Skill {
  id          String      @id @default(uuid())
  name        String      @unique
  slug        String      @unique
  category    SkillCategory
  description String?
  iconUrl     String?
  isVerified  Boolean     @default(false)
  usageCount  Int         @default(0)  // denormalized count for sorting

  userSkillsOffered UserSkill[] @relation("SkillsOffered")
  userSkillsWanted  UserSkill[] @relation("SkillsWanted")

  createdAt   DateTime    @default(now())

  @@index([slug])
  @@index([category])
  @@map("skills")
}

enum SkillCategory {
  TECHNICAL
  CREATIVE
  ACADEMIC
  LANGUAGE
  SPORTS
  LIFESTYLE
  BUSINESS
  OTHER
}

model UserSkill {
  id        String     @id @default(uuid())
  userId    String
  skillId   String
  level     SkillLevel
  note      String?    @db.VarChar(200)  // "I've been coding Python for 3 years"
  createdAt DateTime   @default(now())

  userOffering User?   @relation("SkillsOffered", fields: [userId], references: [id], onDelete: Cascade)
  userWanting  User?   @relation("SkillsWanted", fields: [userId], references: [id], onDelete: Cascade)
  skill        Skill   @relation(fields: [skillId], references: [id])

  @@unique([userId, skillId])
  @@map("user_skills")
}

enum SkillLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

model Availability {
  id        String   @id @default(uuid())
  userId    String
  dayOfWeek Int      // 0=Sunday ... 6=Saturday
  startTime String   // "09:00" — 24h format
  endTime   String   // "17:00"
  timezone  String   @default("UTC")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("availability")
}

model ExchangeRequest {
  id              String        @id @default(uuid())
  senderId        String
  receiverId      String
  offeredSkillId  String        // skill sender offers
  requestedSkillId String       // skill sender wants from receiver
  message         String        @db.Text
  status          RequestStatus @default(PENDING)
  counterMessage  String?       @db.Text
  counterOfferedSkillId   String?
  counterRequestedSkillId String?
  parentRequestId String?       // if this is a counter-offer chain
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  resolvedAt      DateTime?

  sender    User    @relation("RequestSender", fields: [senderId], references: [id])
  receiver  User    @relation("RequestReceiver", fields: [receiverId], references: [id])
  session   Session?

  @@index([senderId])
  @@index([receiverId])
  @@index([status])
  @@map("exchange_requests")
}

enum RequestStatus {
  PENDING
  ACCEPTED
  REJECTED
  COUNTERED
  WITHDRAWN
  EXPIRED
}

model Session {
  id          String        @id @default(uuid())
  requestId   String        @unique
  mentorId    String
  learnerId   String
  skillId     String
  scheduledAt DateTime
  duration    Int           // minutes (default: 60)
  timezone    String        @default("UTC")
  status      SessionStatus @default(SCHEDULED)
  meetingLink String?       // external link (Zoom/Meet/etc)
  notes       String?       @db.Text
  cancelReason String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  completedAt DateTime?

  request  ExchangeRequest @relation(fields: [requestId], references: [id])
  mentor   User   @relation("SessionMentor", fields: [mentorId], references: [id])
  learner  User   @relation("SessionLearner", fields: [learnerId], references: [id])
  reviews  Review[]

  @@index([mentorId])
  @@index([learnerId])
  @@index([scheduledAt])
  @@map("sessions")
}

enum SessionStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
  NO_SHOW
}

model Review {
  id          String   @id @default(uuid())
  sessionId   String
  giverId     String
  receiverId  String
  rating      Int      // 1–5
  comment     String?  @db.Text
  isPublic    Boolean  @default(true)
  createdAt   DateTime @default(now())

  session   Session @relation(fields: [sessionId], references: [id])
  giver     User    @relation("ReviewGiver", fields: [giverId], references: [id])
  receiver  User    @relation("ReviewReceiver", fields: [receiverId], references: [id])

  @@unique([sessionId, giverId])
  @@index([receiverId])
  @@map("reviews")
}

model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  body      String
  link      String?          // relative URL to navigate to
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@map("notifications")
}

enum NotificationType {
  REQUEST_RECEIVED
  REQUEST_ACCEPTED
  REQUEST_REJECTED
  REQUEST_COUNTERED
  SESSION_SCHEDULED
  SESSION_REMINDER
  SESSION_COMPLETED
  REVIEW_RECEIVED
  PROFILE_VIEWED       // optional
  SYSTEM
}

model Report {
  id           String       @id @default(uuid())
  reporterId   String
  targetUserId String
  reason       ReportReason
  description  String?      @db.Text
  status       ReportStatus @default(OPEN)
  resolvedBy   String?      // admin userId
  resolvedAt   DateTime?
  createdAt    DateTime     @default(now())

  reporter User @relation(fields: [reporterId], references: [id])

  @@index([status])
  @@map("reports")
}

enum ReportReason {
  SPAM
  FAKE_PROFILE
  INAPPROPRIATE_CONTENT
  HARASSMENT
  OTHER
}

enum ReportStatus {
  OPEN
  REVIEWING
  RESOLVED
  DISMISSED
}
```

---

## 5. API DESIGN

All API routes live under `src/app/api/`. Follow REST conventions. Use Route Handlers.

### 5.1 Route Structure

```
POST   /api/auth/register
POST   /api/auth/[...nextauth]   (NextAuth handler)

GET    /api/users                     # search/list users (with filters)
GET    /api/users/[username]          # get user profile (public)
PATCH  /api/users/me                  # update own profile
DELETE /api/users/me                  # delete own account
GET    /api/users/me/matches          # get my matches
GET    /api/users/me/dashboard        # dashboard data (aggregated)
GET    /api/users/me/notifications    # get notifications
PATCH  /api/users/me/notifications/[id]  # mark notification read
POST   /api/users/me/notifications/read-all

GET    /api/skills                    # list all skills (with search/filter)
POST   /api/skills                    # create new skill (admin or suggest)
GET    /api/skills/[id]

GET    /api/user-skills               # get skills for current user
POST   /api/user-skills               # add a skill to profile
PATCH  /api/user-skills/[id]          # update skill level/note
DELETE /api/user-skills/[id]

GET    /api/availability              # get current user availability
PUT    /api/availability              # replace availability (full replacement)

GET    /api/requests                  # get requests (sent + received, with filters)
POST   /api/requests                  # send a new request
GET    /api/requests/[id]             # get request detail
PATCH  /api/requests/[id]             # accept / reject / counter
DELETE /api/requests/[id]             # withdraw (sender only)

GET    /api/sessions                  # get sessions for current user
POST   /api/sessions                  # create session (from accepted request)
GET    /api/sessions/[id]             # get session detail
PATCH  /api/sessions/[id]             # update session (reschedule, cancel, complete)

POST   /api/reviews                   # leave a review
GET    /api/reviews/[userId]          # get reviews for user

POST   /api/reports                   # report a user

# Admin routes (require isAdmin: true)
GET    /api/admin/users
PATCH  /api/admin/users/[id]/ban
DELETE /api/admin/users/[id]
GET    /api/admin/reports
PATCH  /api/admin/reports/[id]
GET    /api/admin/stats
```

### 5.2 Response Format

Every API response uses this envelope:

```typescript
// Success
{
  "success": true,
  "data": { /* payload */ },
  "meta": {               // only on paginated responses
    "total": 120,
    "page": 1,
    "perPage": 20,
    "totalPages": 6
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",       // machine-readable
    "message": "Invalid input",       // human-readable
    "details": [                      // optional field-level errors
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### 5.3 Standard Error Codes

```
AUTH_REQUIRED          401 — Not authenticated
FORBIDDEN              403 — Not authorized for this action
NOT_FOUND              404 — Resource not found
VALIDATION_ERROR       422 — Input validation failed
CONFLICT               409 — Duplicate / already exists
RATE_LIMITED           429 — Too many requests
INTERNAL_ERROR         500 — Server error
```

### 5.4 Middleware

Create `src/middleware.ts`:

- Authentication check: protect all `/dashboard`, `/requests`, `/sessions`, `/profile/edit` routes
- Redirect to `/login?from=[originalPath]` if not authenticated
- Admin check: protect all `/api/admin/*` routes
- Rate limiting via Upstash Redis:
  - POST endpoints: 30 req/min per IP
  - Auth endpoints: 10 req/min per IP
  - GET endpoints: 100 req/min per IP

---

## 6. MATCHING ALGORITHM

This is the **core feature**. Implement carefully.

### 6.1 Logic

```typescript
// src/lib/matching.ts

interface MatchResult {
  userId: string;
  matchType: 'DIRECT' | 'PARTIAL_SEND' | 'PARTIAL_RECEIVE';
  matchScore: number; // 0–100
  sharedOfferedSkills: string[]; // skills user can teach that I want
  sharedWantedSkills: string[]; // skills I can teach that user wants
  compatibleAvailability: boolean;
}

function computeMatches(
  currentUser: UserWithSkills,
  candidates: UserWithSkills[],
): MatchResult[] {
  return candidates
    .map((candidate) => {
      // Skills current user teaches that candidate wants to learn
      const iCanTeachThemSkills = intersection(
        currentUser.skillsOffered.map((s) => s.skillId),
        candidate.skillsWanted.map((s) => s.skillId),
      );

      // Skills candidate teaches that I want to learn
      const theyCanTeachMeSkills = intersection(
        candidate.skillsOffered.map((s) => s.skillId),
        currentUser.skillsWanted.map((s) => s.skillId),
      );

      if (
        iCanTeachThemSkills.length === 0 &&
        theyCanTeachMeSkills.length === 0
      ) {
        return null; // No match at all
      }

      // Direct match: mutual skill exchange possible
      const isDirect =
        iCanTeachThemSkills.length > 0 && theyCanTeachMeSkills.length > 0;

      // Score: direct matches weighted higher
      // Each direct match pair = 40 points base
      // Each partial skill = 15 points
      // Availability overlap = +10 bonus
      const hasAvailabilityOverlap = checkAvailabilityOverlap(
        currentUser.availability,
        candidate.availability,
      );

      const score = Math.min(
        100,
        (isDirect ? 40 : 0) +
          iCanTeachThemSkills.length * 15 +
          theyCanTeachMeSkills.length * 15 +
          (hasAvailabilityOverlap ? 10 : 0),
      );

      return {
        userId: candidate.id,
        matchType: isDirect
          ? 'DIRECT'
          : theyCanTeachMeSkills.length > 0
            ? 'PARTIAL_RECEIVE'
            : 'PARTIAL_SEND',
        matchScore: score,
        sharedOfferedSkills: iCanTeachThemSkills,
        sharedWantedSkills: theyCanTeachMeSkills,
        compatibleAvailability: hasAvailabilityOverlap,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.matchScore - a!.matchScore) as MatchResult[];
}
```

### 6.2 Performance

- Pre-compute matches in background (BullMQ job) when user updates their skills
- Cache match list in Redis with key `matches:${userId}` — TTL 1 hour
- Invalidate cache on: user skill add/remove, new user registers
- On `/api/users/me/matches`: serve from cache, fallback to compute on cache miss

---

## 7. FOLDER STRUCTURE

```
peerlift/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   ├── fonts/          # Self-hosted web fonts
│   ├── images/
│   └── icons/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (main)/                 # Authenticated layout group
│   │   │   ├── layout.tsx          # Navbar + sidebar + footer
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── explore/
│   │   │   │   └── page.tsx
│   │   │   ├── requests/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── sessions/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── u/
│   │   │   └── [username]/
│   │   │       └── page.tsx        # Public profile (no auth required)
│   │   ├── admin/                  # Admin area
│   │   │   └── layout.tsx          # Admin-only guard
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── register/
│   │   │   │       └── route.ts
│   │   │   ├── users/
│   │   │   ├── skills/
│   │   │   ├── requests/
│   │   │   ├── sessions/
│   │   │   ├── reviews/
│   │   │   ├── reports/
│   │   │   └── admin/
│   │   ├── layout.tsx              # Root layout (fonts, metadata, providers)
│   │   ├── page.tsx                # Landing page
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   ├── components/                 # (see section 3.4)
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useNotifications.ts
│   │   └── useSocket.ts
│   ├── lib/                        # Core utilities and services
│   │   ├── auth.ts                 # Auth.js config
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── redis.ts                # Upstash Redis client
│   │   ├── matching.ts             # Matching algorithm
│   │   ├── notifications.ts        # Notification creation helpers
│   │   ├── email/
│   │   │   ├── resend.ts
│   │   │   └── templates/
│   │   │       ├── WelcomeEmail.tsx
│   │   │       ├── RequestReceived.tsx
│   │   │       └── SessionReminder.tsx
│   │   ├── cloudinary.ts
│   │   ├── jobs/                   # BullMQ job definitions
│   │   │   ├── queue.ts
│   │   │   ├── workers.ts
│   │   │   ├── computeMatches.job.ts
│   │   │   └── sessionReminder.job.ts
│   │   └── utils.ts
│   ├── types/                      # TypeScript types
│   │   ├── api.ts                  # API request/response types
│   │   ├── db.ts                   # Prisma augmented types
│   │   └── index.ts
│   ├── validations/                # Zod schemas (shared FE+BE)
│   │   ├── auth.schema.ts
│   │   ├── profile.schema.ts
│   │   ├── skill.schema.ts
│   │   ├── request.schema.ts
│   │   └── session.schema.ts
│   ├── stores/                     # Zustand stores
│   │   ├── useAuthStore.ts
│   │   ├── useUIStore.ts
│   │   └── useNotificationStore.ts
│   └── styles/
│       └── globals.css
├── .env.local
├── .env.example                    # Committed — lists all required env vars
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md                       # This file
```

---

## 8. AUTHENTICATION & SECURITY

### 8.1 Auth.js Configuration

```typescript
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // 1. Validate with Zod
        // 2. Find user in DB
        // 3. Compare password with bcrypt.compare()
        // 4. Check if user is banned → throw specific error
        // 5. Return user object
      }
    }),
    GoogleProvider({...})
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.isAdmin = token.isAdmin;
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  }
}
```

### 8.2 Security Checklist

- **Passwords**: bcrypt with 12 salt rounds. Never log, never return in API responses.
- **SQL injection**: impossible via Prisma ORM (parameterized queries)
- **XSS**: React escapes by default. Never use `dangerouslySetInnerHTML` without sanitization (use `DOMPurify` if needed).
- **CSRF**: Next.js Route Handlers + SameSite cookies provide CSRF protection
- **Rate limiting**: Upstash Redis on all auth routes (see section 5.4)
- **Input validation**: Zod on ALL inputs, both client (UX) and server (security)
- **File uploads**: Validate MIME type + file size before Cloudinary upload. Max 5MB for avatars.
- **User banning**: Banned users get `401` on all authenticated requests. Check in middleware.
- **Private data**: Never return `passwordHash`, `banReason`, or email in public user API responses
- **Admin routes**: Double-check `isAdmin` in both middleware and the Route Handler itself (defense in depth)
- **Environment variables**: ALL secrets in `.env.local`. Never hardcode. Validate on startup.

---

## 9. REAL-TIME FEATURES (Socket.io)

Set up a Socket.io server in `/src/lib/socket-server.ts`.

### Events

```typescript
// Client → Server
'notification:subscribe'; // subscribe to own user's notifications
'notification:mark-read'; // { notificationId: string }

// Server → Client
'notification:new'; // { notification: Notification }
'notification:count'; // { count: number } — unread count update

// Future: messaging
'message:send';
'message:received';
'typing:start';
'typing:stop';
```

### Implementation Notes:

- Authenticate Socket connections using the NextAuth JWT token (pass in auth header or query param)
- Use Redis pub/sub (Upstash) as Socket.io adapter for multi-instance compatibility
- On receiving a notification from the database, publish to `notifications:${userId}` Redis channel
- Graceful fallback: if WebSocket fails, long-poll fallback is built into Socket.io

---

## 10. NOTIFICATIONS SYSTEM

Notifications are triggered by server-side events. Create a `createNotification()` helper:

```typescript
// src/lib/notifications.ts
async function createNotification(params: {
  userId: string;
  type: NotificationType;
  relatedEntityId?: string;  // requestId, sessionId, etc.
  actorId?: string;          // user who triggered the notification
}): Promise<void> {
  const templates: Record<NotificationType, (actor?: User) => {title: string; body: string; link: string}> = {
    REQUEST_RECEIVED: (actor) => ({
      title: 'New skill exchange request',
      body: `${actor?.name} wants to exchange skills with you`,
      link: `/requests`,
    }),
    REQUEST_ACCEPTED: (actor) => ({
      title: 'Request accepted!',
      body: `${actor?.name} accepted your request. Time to schedule a session!`,
      link: `/requests`,
    }),
    // ... all types
  };

  // 1. Create in DB
  const notification = await prisma.notification.create({ data: {...} });

  // 2. Push via Socket.io (real-time)
  await redisPublish(`notifications:${params.userId}`, notification);

  // 3. Send email (via BullMQ job — don't block the request)
  await notificationEmailQueue.add('send-notification-email', { notification });
}
```

---

## 11. ERROR HANDLING

### 11.1 API Route Pattern

Every Route Handler follows this pattern:

```typescript
// src/app/api/requests/route.ts
import { withAuth } from '@/lib/api-middleware';
import { requestSchema } from '@/validations/request.schema';
import { ApiError } from '@/lib/errors';

export const POST = withAuth(async (req, { session }) => {
  const body = await req.json();

  // Validate
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(
      'VALIDATION_ERROR',
      'Invalid input',
      parsed.error.flatten(),
    );
  }

  // Business logic
  const result = await createRequest(session.user.id, parsed.data);

  return NextResponse.json({ success: true, data: result }, { status: 201 });
});
```

```typescript
// src/lib/api-middleware.ts
export function withAuth(handler: AuthedHandler) {
  return async (req: NextRequest, ctx: any) => {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'AUTH_REQUIRED',
              message: 'Authentication required',
            },
          },
          { status: 401 },
        );
      }
      return await handler(req, { ...ctx, session });
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: error.code,
              message: error.message,
              details: error.details,
            },
          },
          { status: error.statusCode },
        );
      }
      console.error('[API Error]', error);
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
        },
        { status: 500 },
      );
    }
  };
}
```

### 11.2 Frontend Error Handling

- Use TanStack Query's `onError` callbacks
- Global error boundary in `app/error.tsx`
- Form errors: inline under each field (never alert/toast for validation)
- Network errors: toast notification via Sonner
- 404: Custom illustrated not-found page (warm, friendly tone — not an error)
- 500: Custom error page with "Try again" CTA

---

## 12. PERFORMANCE REQUIREMENTS

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID/INP**: < 100ms
- **CLS**: < 0.1
- **TTFB**: < 600ms

To achieve this:

- Use Next.js Image component for ALL images (automatic WebP/AVIF, lazy loading)
- Paginate all list endpoints (default 20 per page, max 50)
- Use Suspense boundaries with skeleton fallbacks — never full-page spinners
- Prefetch dashboard data server-side (fetch in Server Component)
- Virtualize long lists (react-virtual) if > 100 items
- Debounce search inputs (300ms)
- Optimistic updates for: request status changes, notification read, review submission

---

## 13. ACCESSIBILITY REQUIREMENTS

- All interactive elements must be keyboard navigable
- All images must have meaningful `alt` text
- Color contrast ratio ≥ 4.5:1 for all text
- Focus indicators must be visible (never `outline: none` without replacement)
- Form fields must have associated `<label>` elements
- Modals must trap focus and return focus on close
- `aria-live` regions for dynamic content (notifications, search results)
- Skill level badges: include text, not just color (e.g., "Intermediate" not just amber dot alone)
- Skip-to-content link at top of every page

---

## 14. SEEDING

Create a realistic seed file in `prisma/seed.ts`:

- 20 diverse users with real-sounding names
- 50+ skills across all categories
- Each user has 2–4 skills offered, 2–3 skills wanted
- 30+ exchange requests in various states (pending/accepted/rejected)
- 20+ completed sessions
- 40+ reviews
- Realistic availability slots
- 1 admin user (`admin@peerlift.app` / `Admin123!`)

Seed should be idempotent (use `upsert` not `create`).

---

## 15. ENVIRONMENT VARIABLES

Document ALL required env vars in `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."  # generate with: openssl rand -base64 32
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."  # exposed to client

# Email (Resend)
RESEND_API_KEY="..."
EMAIL_FROM="PeerLift <hello@peerlift.app>"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 16. TESTING STRATEGY

### Unit Tests (Vitest)

- Matching algorithm: test DIRECT, PARTIAL, NO_MATCH cases
- Zod schemas: test valid and invalid inputs
- Utility functions: `computeMatchScore`, `formatAvailability`, etc.

### Integration Tests (Vitest + Prisma test DB)

- API routes: test auth guard, validation, business logic, DB writes
- Use a separate test database (`DATABASE_URL_TEST`)

### E2E Tests (Playwright)

- Critical user flows:
  1. Register → complete profile → add skills
  2. Explore → find a match → send request
  3. Receive request → accept → schedule session
  4. Complete session → leave review
  5. Admin: ban user, resolve report

---

## 17. CODING CONVENTIONS

### TypeScript

```typescript
// Always use explicit return types on functions
function getUser(id: string): Promise<User | null> { ... }

// Use type over interface for unions/intersections; interface for objects
type ApiResponse<T> = { success: true; data: T } | { success: false; error: ApiError };
interface UserProfile { id: string; name: string; ... }

// Never use `any`. Use `unknown` + type narrowing if needed.
// Use `satisfies` operator for config objects

// Enums: use `const` enums or string literal unions
type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
```

### Naming

- Components: PascalCase (`SkillCard.tsx`)
- Hooks: camelCase, prefix `use` (`useMatches.ts`)
- Utilities: camelCase (`computeMatchScore`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_SKILLS_PER_USER = 20`)
- API routes: REST conventions, plural nouns (`/api/users`, `/api/skills`)
- Database tables: snake_case plural (`users`, `exchange_requests`)
- CSS classes: Tailwind utility-first; custom classes use BEM-like naming if needed

### File Length

- Components: max 200 lines. Extract sub-components if larger.
- API routes: max 100 lines. Extract service functions to `src/lib/services/`.
- Never put business logic in components or route handlers. Use service files.

---

## 18. DO NOT LIST

**Never do these things:**

- ❌ Use `any` type in TypeScript
- ❌ Use raw hex/rgb colors in components (use CSS variables)
- ❌ Use `<img>` instead of `next/image`
- ❌ Use inline styles for anything beyond dynamic values
- ❌ Store secrets in code or commit `.env.local`
- ❌ Use `useEffect` for data fetching (use TanStack Query)
- ❌ Return passwords or sensitive data from API responses
- ❌ Use `alert()`, `confirm()`, or `prompt()` — use custom modals/dialogs
- ❌ Use `console.log` in production code (use proper logging)
- ❌ Skip loading states for async operations
- ❌ Skip error states for any data fetch
- ❌ Use `px` for font sizes (use `rem`)
- ❌ Hard-code user IDs, email addresses, or other data
- ❌ Write a component that does more than one thing
- ❌ Mutate Prisma query results directly (spread into new objects)
- ❌ Use synchronous file operations in API routes
- ❌ Allow unauthenticated access to `/api/*` routes that need auth

---

## 19. DEFINITION OF DONE

A feature is **done** when:

1. ✅ TypeScript compiles with zero errors (`tsc --noEmit`)
2. ✅ ESLint passes with zero warnings
3. ✅ Prettier formatting applied
4. ✅ All form inputs have validation (client + server)
5. ✅ Loading state implemented
6. ✅ Error state implemented
7. ✅ Empty state implemented (no items? show EmptyState component)
8. ✅ Responsive at 320px, 768px, 1280px
9. ✅ Keyboard navigable
10. ✅ Unit tests written for business logic
11. ✅ API endpoints tested manually
12. ✅ No `console.log` left in code
13. ✅ Matches design system (tokens, typography, spacing)

---

## 20. FIRST IMPLEMENTATION ORDER

Build in this exact order to ensure a working app at each phase:

```
Phase 1 — Foundation (Day 1)
  [x] Project scaffold (Next.js 14, TS, Tailwind, Prisma)
  [x] Design tokens in globals.css
  [x] Database schema + migrations
  [x] Auth.js setup (credentials + Google)
  [x] Register / Login pages
  [x] Middleware (route protection)

Phase 2 — Core Profile (Day 2)
  [x] Skill model + seed skills
  [x] Complete registration flow (multi-step)
  [x] Profile page (view)
  [x] Profile edit (settings)
  [x] Avatar upload (Cloudinary)
  [x] Availability picker

Phase 3 — Discovery + Matching (Day 3)
  [x] Skill search API (full-text)
  [x] Explore page + filters
  [x] Matching algorithm
  [x] Match badges on user cards

Phase 4 — Requests (Day 4)
  [x] Send request flow
  [x] Requests page (received/sent)
  [x] Accept / Reject / Counter actions
  [x] Notification system (DB)
  [x] Real-time notifications (Socket.io)

Phase 5 — Sessions + Reviews (Day 5)
  [x] Session creation from accepted request
  [x] Sessions page + calendar view
  [x] Complete session flow
  [x] Leave review form
  [x] Reviews on profile page

Phase 6 — Dashboard + Polish (Day 6)
  [x] Dashboard widgets
  [x] Email notifications (Resend)
  [x] Admin panel (basic)
  [x] Landing page
  [x] Error + 404 pages
  [x] Seed data

Phase 7 — QA + Launch (Day 7)
  [x] E2E tests (critical paths)
  [x] Performance audit (Lighthouse)
  [x] Accessibility audit
  [x] Deploy to Vercel
```

---

_End of CLAUDE.md — PeerLift v1.0_
_This document is the authoritative specification. When in conflict with any other instruction, this document wins._
