# Library Tracker PWA

Mobile companion app for the Library Tracker desktop app. Syncs your reading list across devices via a shared Neon PostgreSQL database.

## Features

- View and edit your Physical Books and Web Collection
- Add, edit, and delete books with full field support (title, author, genre, status, tags, cover, notes, RSS feed, source URL, progress)
- Progress bar on book cards (current / total chapters)
- Quick +1 chapter increment directly from the card
- RSS feed panel — view latest chapters and open them directly in browser
- NEW badge for books with unread chapter updates (synced from desktop app)
- Mark Read button to clear update badges
- Duplicate detection — warns if title, RSS URL, or source URL already exists
- Filter by status and genre, sort by Recently Updated / Last Modified / Title / Status
- Card size toggle (compact / normal / large)
- R18 blur toggle
- Favorites
- Reading statistics (Stats tab)
- Settings tab to disconnect and reconnect database
- Installable as a PWA on Android via Chrome

## Setup

### Prerequisites

- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- The Library Tracker desktop app already set up and syncing to that database
- Node.js 18+
- A [Vercel](https://vercel.com) account (free tier works) for deployment

### Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173, enter your Neon connection string, and your library loads.

### Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to https://vercel.com → Add New Project → import your repository
3. Deploy — no environment variables needed
4. Open the deployed URL on your phone in Chrome

### Install on Android

1. Open Chrome on your Android phone
2. Navigate to your Vercel URL
3. Tap the **Add to Home Screen** banner, or use Chrome menu → Add to Home Screen
4. The app installs with its own icon and runs fullscreen

### First Launch

On first open, paste your Neon connection string — the same one from your desktop app's `.env` file:

```
postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

Your library loads automatically. The connection string is stored only on your device.

## Database

The PWA connects to Neon via a Vercel serverless function (`api/query.js`) which acts as a proxy to avoid browser CORS issues. Your connection string is sent only to your own Vercel deployment and from there directly to your Neon database — it is never stored server-side.

### Creating the Database Table

If you're setting up from scratch, run this in your Neon SQL editor to create the `books` table with all required columns:

```sql
CREATE TABLE IF NOT EXISTS books (
  id                  TEXT PRIMARY KEY,
  collection          TEXT NOT NULL,
  title               TEXT NOT NULL,
  author              TEXT DEFAULT '',
  cover_url           TEXT DEFAULT '',
  genre               TEXT DEFAULT '',
  status              TEXT NOT NULL DEFAULT 'unread',
  status_changed_at   TIMESTAMPTZ,
  current_chapter     TEXT DEFAULT '',
  total_chapters      TEXT DEFAULT '',
  year                INTEGER,
  is_favorite         BOOLEAN DEFAULT false,
  notes               TEXT DEFAULT '',
  source_url          TEXT DEFAULT '',
  web_type            TEXT DEFAULT 'novel',
  created_at          TIMESTAMPTZ NOT NULL,
  updated_at          TIMESTAMPTZ NOT NULL,
  deleted             BOOLEAN DEFAULT false,
  rss_feed_url        TEXT DEFAULT '',
  rss_last_item_title TEXT DEFAULT '',
  rss_has_update      BOOLEAN DEFAULT false,
  rss_last_checked    TIMESTAMPTZ,
  is_r18              BOOLEAN DEFAULT false,
  tags                TEXT DEFAULT '',
  rss_last_item_date  TIMESTAMPTZ,
  rss_last_item_url   TEXT DEFAULT '',
  synced              INTEGER DEFAULT 0
);
```

### Migrating an Existing Table

If you already have a `books` table from the desktop app and just need to add the newer columns, run these instead:

```sql
ALTER TABLE books ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '';
ALTER TABLE books ADD COLUMN IF NOT EXISTS is_r18 BOOLEAN DEFAULT false;
ALTER TABLE books ADD COLUMN IF NOT EXISTS rss_last_item_date TIMESTAMPTZ;
ALTER TABLE books ADD COLUMN IF NOT EXISTS rss_last_item_url TEXT DEFAULT '';
```

## RSS Feeds

The PWA tries to fetch RSS feeds directly from your browser. SpaceBattles and SufficientVelocity block server-side requests, so the RSS panel falls back to showing the **last known chapter synced from your desktop app** with a direct link and a link to the threadmarks page.

For Royal Road and other sites that allow cross-origin requests, the full chapter list loads directly.

To get live SB/SV RSS on mobile, build the Android APK using Capacitor — native HTTP requests bypass CORS restrictions entirely.

## Project Structure

```
├── api/
│   ├── query.js        # Vercel serverless — proxies DB queries to Neon
│   └── rss.js          # Vercel serverless — proxies RSS fetch (fallback)
├── public/
│   ├── book-cover.png  # Default cover placeholder
│   ├── icon-192.png    # PWA icon
│   └── icon-512.png    # PWA icon (large)
├── src/
│   ├── App.jsx         # Root — Setup screen or main library app
│   ├── db.js           # Database layer (calls /api/query)
│   ├── constants.js    # Status lists for physical/web collections
│   ├── components/
│   │   ├── BookCard.jsx        # Individual book card with progress bar
│   │   ├── BookModal.jsx       # Add/edit book modal with tabs
│   │   ├── CollectionView.jsx  # Grid view with filters and sort
│   │   ├── RssPanel.jsx        # Chapter list panel
│   │   └── Setup.jsx           # Database connection screen
│   ├── hooks/
│   │   └── useBooks.js         # Data fetching and CRUD for books
│   └── lib/
│       └── http.js             # Native HTTP helper for Capacitor
├── capacitor.config.json   # Capacitor Android config
└── vercel.json             # Vercel routing config
```

## Capacitor (Android APK)

To build a native Android APK that bypasses CORS for full RSS support:

```bash
npm install
npx cap init "Library Tracker" "com.kentcas.librarytracker" --web-dir dist
npx cap add android
npm run android
```

This opens Android Studio. Build the APK via **Build → Build APK(s)**, then install on your phone.
