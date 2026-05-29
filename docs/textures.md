# Textures

Endpoints for retrieving cape textures, preview renders, and listing available capes.

---

## GET /assets/capes/:filename

Serve a cape texture PNG file directly.

### Request

**Method:** `GET`  
**URL:** `/assets/capes/{capeId}.png`

Textures are served statically from the `assets/capes/` directory. Any PNG file in that directory is available at this path.

### Response

| Status | Condition                          |
|--------|------------------------------------|
| 200    | The PNG file content               |
| 404    | No cape texture with that ID       |

### Example

```bash
curl -O http://localhost:8000/assets/capes/1490.png
```

---

## GET /cape-list

Retrieve a list of all available cape IDs.

### Request

**Method:** `GET`  
**URL:** `/cape-list`

### Response

#### Success (200)

```json
[
    "1490",
    "2000",
    "2219",
    "4428",
    "5161",
    "5792",
    "5803",
    "8154",
    "8204"
]
```

Returns an array of cape IDs (filenames in `assets/capes/` without the `.png` extension).

### Errors

| Status | Condition                                  |
|--------|--------------------------------------------|
| 500    | Filesystem read failure or server error    |

### Example

```bash
curl http://localhost:8000/cape-list
```

---

## GET /preview/capes/:id

Retrieve a WebP render preview for a cape.

### Request

**Method:** `GET`  
**URL:** `/preview/capes/{capeId}`

### URL Parameters

| Parameter | Type   | Required | Description            |
|-----------|--------|----------|------------------------|
| `id`      | string | yes      | The cape ID to preview |

### Response

| Status | Condition                          |
|--------|------------------------------------|
| 200    | The WebP preview file content      |
| 404    | No render preview for that cape ID |

### Example

```bash
curl -O http://localhost:8000/preview/capes/1490
```

---

## POST /other

Bulk lookup of cape URLs for multiple usernames.

### Request

**Method:** `POST`  
**Content-Type:** `application/json`

### Body

An array of Minecraft usernames to look up:

```json
["Player1", "Player2", "Player3"]
```

### Response

#### Success (200)

```json
{
    "Player1": "http://localhost:8000/assets/capes/1490.png",
    "Player2": null,
    "Player3": "http://localhost:8000/assets/capes/2219.png"
}
```

Returns an object mapping each username to their cape URL, or `null` if the user is not registered or has no cape equipped.

### Errors

| Status | Condition                                        |
|--------|--------------------------------------------------|
| 400    | Request body is not an array                     |
| 500    | Filesystem read failure or unexpected error      |

### Example

```bash
curl -X POST http://localhost:8000/other \
  -H "Content-Type: application/json" \
  -d '["Player1", "Player2"]'
```
