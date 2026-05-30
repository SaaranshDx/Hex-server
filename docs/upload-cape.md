# POST /upload-cape

Upload a new cape texture with optional preview image.

## Request

**Method:** `POST`  
**Content-Type:** `multipart/form-data`

### Headers

| Header  | Type   | Required | Description         |
|---------|--------|----------|---------------------|
| `token` | string | yes      | Authentication token |

### FormData Fields

| Field                | Type     | Required | Description                                    |
|----------------------|----------|----------|------------------------------------------------|
| `capeTexture`        | file     | yes      | PNG image of the cape texture                  |
| `previewImage`       | file     | no       | PNG/WebP preview image for the cape            |
| `category`           | string   | yes      | Cape category: `Community`, `Partner`, `Hex`, `Staff`, or `Mojang` |
| `playerpermission[]` | string[] | yes      | Array of IGNs allowed to use this cape, or `*` for everyone |

### Category Permission Levels

Each category requires a minimum `permissionLvl` on the user's token:

| Level | Community | Partner | Hex  | Staff | Mojang |
|-------|-----------|---------|------|-------|--------|
| 1     | ✅        | ❌      | ❌   | ❌    | ❌     |
| 2     | ✅        | ✅      | ❌   | ❌    | ❌     |
| 3     | ✅        | ✅      | ✅   | ✅    | ✅     |

## Response

### Success (200)

```json
{
    "success": true,
    "capeId": "1490",
    "authorid": "1189872646163284041",
    "authorname": "PlayerName",
    "texture": "/assets/capes/1490.png",
    "preview": "/renders/capes/1490.png"
}
```

`preview` is `null` if no preview image was provided.

### Errors

| Status | Condition                                                     |
|--------|---------------------------------------------------------------|
| 400    | `playerpermission` is not an array                            |
| 400    | `category` field is missing                                   |
| 400    | `category` is not `"Community"`, `"Partner"`, `"Hex"`, `"Staff"`, or `"Mojang"` |
| 400    | `capeTexture` file not provided                               |
| 401    | `token` header is missing, invalid, or expired                |
| 403    | User's `permissionLvl` is too low for the requested category  |
| 500    | Filesystem write failure or unexpected server error           |

## Example

```bash
curl -X POST http://localhost:8000/upload-cape \
  -H "token: <token>" \
  -F "category=Community" \
  -F "playerpermission[]=*" \
  -F "capeTexture=@cape.png" \
  -F "previewImage=@preview.png"
```
