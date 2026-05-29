# POST /change-cape

Change the active cape for the authenticated user.

## Request

**Method:** `POST`  
**Content-Type:** `application/json`

### Body

| Field    | Type   | Required | Description                  |
|----------|--------|----------|------------------------------|
| `token`  | string | yes      | Authentication token         |
| `capeId` | string | yes      | ID of the cape to equip      |

### Player Permission Check

Before changing the cape, the endpoint reads `cape_meta/{capeId}.json` to determine who can equip it:

| Condition                                                        | Result               |
|------------------------------------------------------------------|----------------------|
| Metadata file does not exist                                     | ✅ Allow everyone    |
| `playerpermission` array contains `"*"`                          | ✅ Allow everyone    |
| `playerpermission` array contains the user's IGN                 | ✅ Allow             |
| `playerpermission` array exists but has neither `"*"` nor IGN    | ❌ Deny (403)        |

## Response

### Success (200)

```json
{
    "success": true,
    "message": "Successfully updated PlayerName's cape to 1490."
}
```

### Errors

| Status | Condition                                                          |
|--------|--------------------------------------------------------------------|
| 400    | `token` field is missing                                           |
| 400    | `capeId` field is missing                                          |
| 401    | Provided `token` is invalid or expired                             |
| 403    | Cape's `playerpermission` does not include user's IGN or `"*"`     |
| 404    | `token` is valid but no registered user metadata was found         |
| 500    | Filesystem read/write failure or unexpected server error           |

## Example

```bash
curl -X POST http://localhost:8000/change-cape \
  -H "Content-Type: application/json" \
  -d '{"token": "<token>", "capeId": "1490"}'
```
