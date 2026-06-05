# Hex Server API Docs

## Authentication & User

| Endpoint | File |
|----------|------|
| `GET /registration-state/:username` | [registration-state.md](registration-state.md) |
| `GET /profile/:username` | [profile.md](profile.md) |
| `POST /change-cape` | [change-cape.md](change-cape.md) |
| `POST /upload-cape` | [upload-cape.md](upload-cape.md) |

## Capes & Textures

| Endpoint | File |
|----------|------|
| `GET /assets/capes/:filename`, `GET /cape-list`, `GET /preview/capes/:id`, `POST /other` | [textures.md](textures.md) |
| `GET /cape/meta/:id` | [cape-meta-id.md](cape-meta-id.md) |
| Cape Renderer API (Cloudflare Worker) | [cape-previews.md](cape-previews.md) |
