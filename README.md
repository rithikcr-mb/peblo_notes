# Peblo Notes 📝

An AI-powered, premium markdown workspace designed for seamless thought capture, context-aware intelligence, and deep productivity analytics. Built with a robust Next.js enterprise stack, Peblo Notes features a high-performance three-panel workspace, an auto-saving engine, and native integration with the Google Gemini API.

---

## Architecture Overview

Peblo Notes is a full-stack AI-powered notes workspace built with Next.js App Router, Prisma, PostgreSQL, and Google Gemini.

The system is structured around:

- Server-rendered dashboard routes
- API-driven note mutations
- React Query for async server-state synchronization
- Prisma ORM for relational persistence
- Streaming AI responses for low-latency UX
- Debounced autosave for responsive editing

### Core Flow

Authentication → Dashboard → Notes Workspace → AI Actions → Shared Notes / Analytics

### AI Workflow

Client Action → API Route → Gemini API → Stream Response → Persist Generation → Update UI

### Autosave Strategy

Editor Input → Debounced Mutation → Database Update → Save Status Feedback

---

## Tech Stack

### Frontend
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query

### Backend
- Next.js Route Handlers
- Prisma ORM
- PostgreSQL (Neon)

### Authentication
- NextAuth.js
- bcryptjs password hashing

### AI Integration
- Google Gemini API
- Streaming AI responses
- Background persistence for AI generations

### Validation & Forms
- Zod
- React Hook Form

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:

* **Node.js** (v18.x or higher)
* **npm** or **pnpm**
* A running **PostgreSQL** instance (or a serverless connection string from Neon DB)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/rithikcr-mb/peblo_notes.git
cd peblo_notes
npm install

```

### 2. Configure Environment Variables

Create a `.env` file in the root directory by copying the blueprint provided:

```bash
cp .env.example .env

```

Populate the missing credentials:

```env
# Database Settings (Neon or Local PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secure-jwt-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google Gemini Core API Key
GEMINI_API_KEY="your-google-gemini-api-key"

```

### 3. Database Migration & Initialization

Generate your local Prisma client declarations and execute structural schema synchronization:

```bash
npx prisma generate
npx prisma db push

```

### 4. Run the Seed Script

Populate your environment with mock user accounts, sample rich-text markdown files, and default tags to instantly test UI analytics layouts:

```bash
npm run seed

```

### 5. Launch the Local Server

```bash
npm run dev

```

Open **[http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)** inside your browser to interact with the system.

---
## Technical Decisions

### Why React Query
React Query was used to separate async server state from local UI state while simplifying autosave synchronization, mutation handling, and cache invalidation.

### Why Prisma + PostgreSQL
Prisma provided type-safe relational modeling for notes, tags, AI generations, and shared links while keeping schema evolution manageable.

### AI Response Streaming
AI responses are streamed incrementally to improve perceived responsiveness and reduce blocking during long generations.

### Autosave Architecture
Autosave uses debounced mutations to minimize unnecessary database writes while preserving a responsive editing experience.

### Serverless Compatibility
The application is designed around serverless-friendly API routes and PostgreSQL connection pooling recommendations for Neon deployments.
---

## ✨ Features Checklist & Milestones

### 🎛️ Workspace Core

* [x] **Three-Panel Grid Matrix:** Collapsible sidebars, note navigator, markdown composer.
* [x] **Auto-Save Engine:** Implemented 1000ms debounce handlers to persist text states automatically.
* [x] **Live Split View Preview:** Instant context rendering using `react-markdown`.

### 🤖 Intelligent Gemini Copilot

* [x] **Contextual Summarization:** Generates automated, structured TL;DR summaries of complex text.
* [x] **Action Item Extractor:** Converts paragraphs into interactive checklists instantly.
* [x] **Asynchronous Title Generator:** Intelligently titles nameless drafts using paragraph inference.

### 🌐 System Protection & Distribution

* [x] **Secure Access Gate:** NextAuth router middleware protection with `bcryptjs` password hashing.
* [x] **Crypto-Token Shared Links:** Secure, read-only static paths (`/shared/{token}`) for selective public document exposure.
* [x] **Productivity Analytics:** Activity heatmap generation and writing analytics charts powered by `recharts`.

---

## Production Considerations

- Environment variables documented via `.env.example`
- AI routes protected with basic rate limiting
- Protected dashboard routes via authentication middleware
- Prisma indexes added for common note query paths
- Production builds validated before submission
- Public share links isolated from authenticated note routes

---

## Known Limitations / Future Improvements

- Current rate limiting uses in-memory storage and should be replaced with Redis or Vercel KV in distributed environments.
- Search currently relies on client-side filtering and could evolve toward full-text database search.
- Realtime collaboration is out of scope for this submission but the architecture is structured to evolve toward collaborative editing.
- AI retry/cancellation flows can be expanded further for production-scale UX resilience.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.