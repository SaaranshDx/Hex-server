# Hex Server

Minecraft cape management backend with a Discord bot, REST API, and web catalog frontend. Part of the Hex ecosystem.

## Stack

- **Backend** — Node.js, Express, Discord.js
- **Frontend** — Vanilla JS, skinview3d (3D player preview)
- **Auth** — Discord OTP (in-memory tokens) + FastAPI email OTP (SQLite + SQLAlchemy)
- **Storage** — File-based (PNG textures, WebP renders, JSON metadata)

## Features

- **Discord Slash Commands** — Register Minecraft accounts, login (generates catalog link), set/remove capes, manage permissions, upload files to GhostDrop
- **REST API** — Profile lookups, cape upload, cape change, cape metadata, catalog listing
- **Web Catalog** — Browse capes with search/filter by category (Hex, Partner, Community), 3D skin + cape preview, undo/redo history
- **Permission System** — 3-tier (User, Partner, Admin) controls upload access by category; per-cape player whitelist

## Getting Started

```bash
bun install    # or npm install
cp .env.example .env   # configure DISCORD_TOKEN, CLIENT_ID, GUILD_ID
bun start      # starts Express + Discord bot on :8000
```

### Python Auth Server (optional)

```bash
pip install -r src/requirements.txt
uvicorn src.main:app
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/profile/:username` | Player profile |
| `GET` | `/cape-list` | List all cape IDs |
| `GET` | `/cape/meta/:id` | Cape metadata |
| `GET` | `/preview/capes/:id` | Cape render preview |
| `POST` | `/upload-cape` | Upload cape (multipart with token auth) |
| `POST` | `/change-cape` | Change active cape (token + capeId) |
| `GET` | `/profile/meta/:token` | User data from token |
| `POST` | `/other` | Bulk cape URL lookup |
| `GET` | `/registration-state/:username` | Registration check |

See [`docs/`](docs/) for detailed endpoint docs.

## Discord Commands

- `/register <ign> <cracked|microsoft>` — Link Minecraft account
- `/login` — Get catalog access link
- `/set-cape <capeid>` — Equip a cape
- `/remove-cosmetics` — Unequip cape
- `/set-permission <ign> <level>` — Admin only
- `/drop <file>` — Upload file to GhostDrop

## Project Structure

```
hex-server/
├── index.js              # Express + Discord bot entry
├── commands/             # Discord slash command handlers
├── utils/                # Shared utilities (cape, token, profile)
├── public/               # Web catalog frontend
├── assets/
│   ├── capes/            # Cape texture PNGs
│   └── renders/capes/    # Cape preview WebP files
├── cape_meta/            # Cape metadata JSON
├── user_meta/            # User registration JSON
├── src/                  # FastAPI auth backend
└── docs/                 # API documentation
```
