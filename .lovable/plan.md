# LocalGram — Plan

A hyperlocal community board where users set their location (city, area, pincode), create posts, and view posts from their pincode.

## Backend (Lovable Cloud)

Enable Lovable Cloud and create a `posts` table:

- `id` uuid pk
- `name` text
- `content` text
- `city` text
- `area` text
- `pincode` text (indexed)
- `created_at` timestamptz default now()

RLS: public read + public insert (no auth required for v1).

## API

Two TanStack Start server routes under `src/routes/api/posts/`:

- `POST /api/posts` — validates with zod (name 1–60, content 1–500, city/area 1–60, pincode 4–10 digits), inserts row, returns created post.
- `GET /api/posts/$pincode` — returns posts for that pincode, newest first (limit 100).

Both use the admin Supabase server client (no user auth in v1).

## Frontend

Single page at `src/routes/index.tsx` with two states:

**1. Location not set** — centered card with City, Area, Pincode inputs and "Set Location" button. Stores location in component state (and `localStorage` for persistence across reloads).

**2. Location set** — header shows current location with a "Change" link, then two stacked sections:

- **Create Post card**: Name input, content textarea, "Post" button. On submit → POST `/api/posts` with location fields merged in → on success, clear form and refetch feed.
- **Posts Feed**: cards showing name, content, "City · Area · Pincode", relative time, and a disabled "Chat (Coming Soon)" button. Empty state when no posts.

Uses TanStack Query (`useQuery` for feed keyed on pincode, `useMutation` for create with `invalidateQueries` on success). Toast feedback via existing `sonner`.

## Design

Soft, modern, card-based. Light neutral background, rounded-2xl cards with subtle shadow, generous spacing. Single accent color via design tokens in `src/styles.css` (warm coral or soft indigo — will pick one). Responsive: single column on mobile, max-w-2xl centered on desktop. Use existing shadcn `Card`, `Input`, `Textarea`, `Button`, `Label`.

## Files

- New: `src/routes/api/posts/index.ts`, `src/routes/api/posts/$pincode.ts`, `src/components/LocationForm.tsx`, `src/components/CreatePost.tsx`, `src/components/PostsFeed.tsx`, `src/lib/posts.ts` (types + fetch helpers)
- Modified: `src/routes/index.tsx` (real page), `src/routes/__root.tsx` (Toaster + title), `src/styles.css` (palette tweak)
- Migration: create `posts` table with RLS

## Out of scope (v1)

Chat, auth, edit/delete, image uploads, pagination, moderation.
