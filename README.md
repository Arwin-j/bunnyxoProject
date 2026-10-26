# Bunny Hub 🐰🌸

A cozy, cute community website (sticker-book style: thick outlines, offset shadows, pastel skins, rounded font) for a cozy-games brand with a Discord community.

## ⚠️ Important Note on Temporary Admin & Storage

- **Edits made in the Admin area are stored ONLY in your local browser (`localStorage`) under the key `hh.events.v1` until Supabase is connected in a later step. Other public visitors will NOT see changes made in your local browser session.**
- **The temporary login (`bunnyAdmin` / `bunny`) is a front-end placeholder ONLY and provides NO real security.** It is stored in `src/config/tempAdmin.ts` and evaluated purely client-side with session tracking in `sessionStorage`. Do not store confidential information.

## ✨ Features

- **Public Website:**
  - **Welcome Page (`/`):** Animated entry portal with bunny logo, responsive stripe transition (respects `prefers-reduced-motion`), and admin shortcut wrench button.
  - **Home Page (`/home`):** Top navigation bar, welcoming sticker banner, live **Current Event** box, and upcoming events grid.
  - **Events Page (`/events`):** Filter cozy events across platforms: Discord (💬), Heartopia (🌸), Petit Planet (🪐), and Loftia (✨).
  - **Island Map (`/map`), Guides (`/guides`), and Updates (`/updates`):** Cozy sticker-book placeholder pages ready for community expansions.
- **Admin Area ("Dev Console"):**
  - **Login (`/admin/login` / `/auth`):** Login form matching the brand theme. Credentials: `bunnyAdmin` / `bunny`.
  - **Overview (`/admin`):**
    - Real-time counters: **Live**, **Upcoming**, and **Ended** (computed dynamically from UTC timestamps).
    - Dense developer console table with ID, title, platform chip, location, date, time, weekday, status chip, visibility, and quick Edit / Delete actions.
    - Full search & filter toolbar (by text, platform, time status, and visibility).
    - Safe confirmation dialogs for destructive actions.
  - **Edit / Create (`/admin/edit`):**
    - Event selector dropdown or "New event" button.
    - Fields: Title (with 80 char validation), Platform, Dependent Location (e.g. Heartopia locations vs Discord channels with custom "Other..." text option), Start Date & Time, End Date & Time, Auto-derived Weekday chip, Timezone selector, Details, Prize, and Visibility (`published` | `draft`).
    - Live JSON preview panel showing the exact stored UTC object.
    - Unsaved changes indicator, reset changes, save as new (duplicate), delete, toast alerts, and `Ctrl/Cmd+S` keyboard shortcut.
  - **Footer Status Bar:** Developer console status with active storage key, record count, and live UTC clock.

## 🛠️ Architecture & Data Layer

- **Repository Pattern (`src/data/`):**
  - All event persistence is abstracted behind `EventsRepository` (`list`, `get`, `create`, `update`, `delete`).
  - Implemented by `LocalEventsRepository`, storing versioned JSON in `localStorage['hh.events.v1']`.
  - Empty storage is automatically seeded once with the original sample events and never overwrites existing user data.
  - Public pages only query events where `visibility === 'published'`.
  - In a future update, swapping to Supabase requires writing a single `SupabaseEventsRepository.ts` file without altering any UI components.

## 🚀 Running the Project

```bash
# Start development server
node node_modules/vite/bin/vite.js

# Build production bundle
node node_modules/vite/bin/vite.js build

# Preview production build
node node_modules/vite/bin/vite.js preview
```
