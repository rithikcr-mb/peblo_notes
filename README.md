Here is a professional, production-ready `README.md` tailored specifically to your tech stack and feature set. It includes architecture diagrams, setup guides, and structural breakdowns to make your repository stand out to any technical reviewer or interviewer.

---

# Peblo Notes 📝

An AI-powered, premium markdown workspace designed for seamless thought capture, context-aware intelligence, and deep productivity analytics. Built with a robust Next.js enterprise stack, Peblo Notes features a high-performance three-panel workspace, an auto-saving engine, and native integration with the Google Gemini API.

---

## 🏗️ System Architecture & Data Flow

Peblo Notes is built with a serverless, decoupled architecture prioritizing low-latency client state management and streaming AI workflows.

### 🌐 Core Application Flow

```
[Login/Signup Page] 
       ↓
[Main Dashboard] 
       ↓
[Three-Panel Workspace: Sidebar List → Editor Panel → AI Tools Drawer]
       ↓
[Public Shared Page] / [Productivity Analytics Dashboard]

```

### 🤖 Gemini AI Workflow

```
[Frontend UI Action] ──> [Next.js API Route] ──> [Gemini API Server] ──> [Prisma DB Log] ──> [Stream UI / Toast View]

```

### ⚡ Auto-Save Engine

```
[User Types Content] ──> [Debounce Timer (1000ms)] ──> [API Server Trigger] ──> [Update "Saved" UI Status]

```

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Next.js 14+ (App Router) with TypeScript
* **Database & ORM:** PostgreSQL (Serverless via Neon DB) + Prisma ORM
* **Authentication:** Auth.js (NextAuth.js) using JWT-based persistent sessions & `bcryptjs`
* **State Management & Fetching:** Zustand (Global Client State) + React Query (Server Cache Coordination)
* **AI Engine:** Google Gemini API (`@google/generative-ai`)
* **Styling & UI:** Tailwind CSS + `shadcn/ui` + Lucide Icons
* **Data Validation:** Zod + React Hook Form

---

## 🗄️ Database Schema (Entity-Relationship)

The underlying relational schema is optimized for cascading performance, indexing constraints, and relational tagging structures.

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  password      String
  notes         Note[]
  aiGenerations AiGeneration[]
  createdAt     DateTime       @default(now())
}

model Note {
  id          String       @id @default(cuid())
  title       String
  content     String       @db.Text
  isArchived  Boolean      @default(false)
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  tags        Tag[]
  sharedLinks SharedLink[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Tag {
  id    String @id @default(cuid())
  name  String
  notes Note[]
}

model SharedLink {
  id        String   @id @default(cuid())
  token     String   @unique
  isActive  Boolean  @default(true)
  noteId    String
  note      Note     @relation(fields: [noteId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model AiGeneration {
  id        String   @id @default(cuid())
  type      String   // "summary" | "action_items" | "title"
  result    String   @db.Text
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

```

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

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.