

<h1 align="center">📍 Findora</h1>

<h3 align="center">
  <em>Lost something on campus? We'll help you find it.</em>
</h3>

<p align="center">
  A real-time campus lost &amp; found portal that connects students with their missing belongings — no sign-ups, no downloads, just open and search.
</p>

---

## 🧠 The Problem

Every college campus deals with the same frustrating cycle:

> **A student loses something → They ask around → Nobody knows → The item sits unclaimed in a random office → It's eventually thrown away.**

- There's no centralized system for reporting or finding lost items.
- WhatsApp groups and notice boards are chaotic, unsearchable, and quickly buried.
- Students on different devices can't see what others have reported.
- Staff have no way to manage or track item statuses.

**Result:** Hundreds of recoverable items go unclaimed every semester.

---

## 💡 Our Solution

**Findora** is a real-time, cloud-synced lost and found web portal designed specifically for college campuses.

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   📝 Report  │  ───▶ │  🔍 Search &     │  ───▶ │  🤝 Reunite  │
│   Lost/Found │       │     Filter       │       │   & Claim    │
│     Item     │       │   Instantly      │       │  Your Item   │
└──────────────┘       └──────────────────┘       └──────────────┘
```

- **Students** report lost/found items with photos, categories, and location details
- **Everyone** can search and filter listings in real-time — no refresh needed
- **Admins** manage all submissions through a dedicated dashboard
- **Zero friction** — no login required for students, works on any device

---

## 🚀 Key Features

| Feature                    | What It Does                                                               |
| -------------------------- | -------------------------------------------------------------------------- |
| ⚡ **Real-Time Sync**      | All reports instantly appear on every user's screen via Supabase Realtime  |
| 🔍 **Smart Search**        | Search across item names, descriptions, and categories simultaneously      |
| 🗂️ **Advanced Filters**    | Filter by status, category, location, and date range                       |
| 📸 **Photo Upload**        | Drag-and-drop image upload with cloud storage                              |
| 📌 **Status Lifecycle**    | Track items: Lost → Found → Claimed                                        |
| 🔐 **Admin Panel**         | Password-protected dashboard with stats, bulk actions, and item management |
| 🏷️ **Quick Tags**          | One-click popular search tags (Phone, Wallet, Laptop, Keys, ID Card)       |
| 📱 **Fully Responsive**    | Works seamlessly on desktop, tablet, and mobile                            |
| 🌙 **Premium Dark UI**     | Glassmorphism, gradient accents, and micro-animations                      |
| 🔔 **Toast Notifications** | Beautiful feedback on every user action                                    |

---

## 🛠️ Tech Stack

| Layer         | Technology                           | Why We Chose It                                              |
| ------------- | ------------------------------------ | ------------------------------------------------------------ |
| **Frontend**  | HTML5, CSS3, JavaScript (ES6+)       | Zero build tools = instant deployment, no complexity         |
| **Database**  | Supabase PostgreSQL                  | Free tier, real-time subscriptions, REST API out of the box  |
| **Real-Time** | Supabase Realtime                    | Postgres Changes for live sync without WebSocket boilerplate |
| **Storage**   | Supabase Storage                     | Public bucket for item photos with CDN-backed URLs           |
| **Design**    | Inter (Google Fonts), Font Awesome 6 | Modern typography + comprehensive icon set                   |

> **Why no framework?** We intentionally built with vanilla HTML/CSS/JS to prove that a polished, production-grade app doesn't need React, Next.js, or any bundler. The entire project is **under 10 files** and deploys by simply opening `index.html`.

---

## 🏗️ Architecture

```
                    ┌─────────────────────────┐
                    │      Supabase Cloud      │
                    │  ┌─────────┐ ┌────────┐  │
                    │  │ Postgres│ │Storage │  │
                    │  │   DB    │ │(Images)│  │
                    │  └────┬────┘ └───┬────┘  │
                    │       │          │       │
                    │  ┌────┴──────────┴────┐  │
                    │  │  Realtime Engine   │  │
                    │  └────────┬───────────┘  │
                    └───────────┼───────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
        ┌─────┴─────┐   ┌──────┴──────┐   ┌─────┴─────┐
        │  Student   │   │  Student    │   │   Admin   │
        │  Browser 1 │   │  Browser 2  │   │  Browser  │
        │ index.html │   │ index.html  │   │ admin.html│
        └───────────┘   └────────────┘   └───────────┘
              ▲                ▲                ▲
              └────── All synced in real-time ──┘
```

---

## 📂 Project Structure

```
Findora/
├── index.html          # Main portal — hero, listings, filters, report modal
├── admin.html          # Admin dashboard — login, overview, item management
├── style.css           # Core design system — 21KB of hand-crafted CSS
├── admin.css           # Admin-specific styles — sidebar, tables, charts
├── app.js              # Main app logic — CRUD, search, filters, real-time
├── admin.js            # Admin logic — auth, tables, bulk actions, stats
├── supabase-config.js  # Supabase client initialization (3 lines!)
├── setup.sql           # Database schema, RLS policies, storage & seed data
└── README.md
```

---

## ⚡ Quick Start

### 1. Clone & Configure

```bash
git clone https://github.com/sh4dr0x/Findora.git
cd Findora
```

### 2. Set Up Supabase (5 minutes)

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** → paste the contents of `setup.sql` → **Run**
3. Copy your project URL and anon key from **Settings → API**

### 3. Add Credentials

```javascript
// supabase-config.js
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key-here";
```

### 4. Launch

Open `index.html` in a browser. **Done.** No `npm install`, no build step, no server.

> 💡 For development, use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code.

---

## 🔐 Admin Access

Navigate to `admin.html` or click the **Admin** link in the navbar.

**What admins can do:**

- 📊 View real-time overview stats (total, lost, found, claimed)
- 📋 See the 5 most recent reports at a glance
- 📈 Category breakdown with visual bar charts
- 🔎 Search and filter across all items
- ✅ Mark items as claimed with one click
- 🗑️ Delete individual items or bulk-select and remove
- 🧹 Clear all claimed/resolved entries at once

---

## 🎨 Design Philosophy

We didn't just build a functional tool — we built something **students would actually want to use**.

| Design Choice         | Implementation                                                    |
| --------------------- | ----------------------------------------------------------------- |
| **Dark Theme**        | Rich `#0a0a0f` background with layered surfaces                   |
| **Glassmorphism**     | `backdrop-filter: blur()` on cards, modals, navbar                |
| **Gradient Accents**  | Purple → Cyan (`#7c5cff` → `#00e5a0`) throughout                  |
| **Micro-Animations**  | Scroll-triggered reveals, hover transforms, counter animations    |
| **Responsive Grid**   | CSS Grid with adaptive breakpoints for all screen sizes           |
| **Custom Components** | Hand-built search bars, filter chips, toast system, modal dialogs |

---

## 🧩 Challenges We Faced

| Challenge                           | How We Solved It                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| **Real-time sync across devices**   | Migrated from localStorage to Supabase with Postgres Changes subscription     |
| **Image storage without a backend** | Used Supabase Storage with public bucket and CDN-backed URLs                  |
| **Keeping it zero-config**          | No frameworks, no bundlers — just `<script>` tags and the Supabase CDN client |
| **Admin security without auth**     | Session-based admin login with password gate (suitable for campus deployment) |
| **Search performance**              | Client-side filtering with debounced input for instant results                |

---

## 🔮 What's Next

If we had more time, here's what we'd build:

- [ ] 🔑 **Supabase Auth** — Email/Google sign-in for verified submissions
- [ ] 📧 **Email Notifications** — Alert users when a matching item is found
- [ ] 🗺️ **Campus Map Integration** — Pin locations on an interactive map
- [ ] 🤖 **AI Matching** — Auto-suggest potential matches between lost and found items
- [ ] 📊 **Analytics Dashboard** — Trends, peak loss times, hotspot locations
- [ ] 🌐 **PWA Support** — Install as a native app on mobile devices

---

## 📜 License

This project is open source under the [MIT License](LICENSE).

---

<p align="center">
  <strong>⭐ If you liked Findora, drop a star — it means a lot!</strong>
</p>

<p align="center">
  <em>Built with ❤️ at Hackathon 2026</em>
</p>
