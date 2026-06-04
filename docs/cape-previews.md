# Cape Renderer API

Generate a rendered cape preview from a Minecraft cape image.

## Endpoint

### Production

```http
POST https://hex-cape-renderer.saaransh762.workers.dev/
```

### Local Development

```http
POST http://127.0.0.1:8787/
```

---

## Request

Send a multipart/form-data request containing a single file field named `cape`.

### Parameters

| Field  | Type       | Required | Description                      |
| ------ | ---------- | -------- | -------------------------------- |
| `cape` | File (PNG) | Yes      | Minecraft cape texture to render |

### Example Request

```bash
curl -X POST \
  -F "cape=@cape.png" \
  https://hex-cape-renderer.saaransh762.workers.dev/ \
  --output rendered.png
```

---

## Response

### Success

**Status Code:** `200 OK`

Returns a rendered PNG image.

**Content-Type**

```http
image/png
```

### Error

**Status Code:** `4xx` or `5xx`

Returns a plain text error message.

Example:

```text
Invalid cape texture
```

---

## Python Example

```python
import requests

URL = "https://hex-cape-renderer.saaransh762.workers.dev/"

files = {
    "cape": open("cape.png", "rb")
}

response = requests.post(URL, files=files)

print("Status:", response.status_code)

if response.status_code == 200:
    with open("out.png", "wb") as f:
        f.write(response.content)

    print("Saved as out.png")
else:
    print(response.text)
```

---

## Notes

* Only PNG cape textures are supported.
* The request must use `multipart/form-data`.
* The returned image is generated dynamically.
* Large or malformed files may be rejected.

---

## Example Workflow

```text
cape.png
    │
    ▼
POST / (multipart/form-data)
    │
    ▼
Cape Renderer API
    │
    ▼
Rendered Preview (PNG)
```
