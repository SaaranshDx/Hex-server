# GET /profile/:username

Retrieve the active cape texture information for a registered user.

## Request

**Method:** `GET`  
**URL:** `/profile/{username}`

### URL Parameters

| Parameter  | Type   | Required | Description                   |
|------------|--------|----------|-------------------------------|
| `username` | string | yes      | Minecraft username (IGN) to look up |

## Response

### Success (200)

If the user is registered and has a cape equipped:

```json
{
    "textureURL": "http://localhost:8000/assets/capes/1490.png",
    "staticURL": "http://localhost:8000/assets/capes/1490.png",
    "animatedCape": false
}
```

If the user is registered but has no cape equipped (`capeid` is `"null"`):

```json
{
    "textureURL": "http://localhost:8000/assets/capes/null.png",
    "staticURL": "http://localhost:8000/assets/capes/null.png",
    "animatedCape": false
}
```

If the user is not registered (no `user_meta/{username}.json` file exists), a fallback response is returned:

```json
{
    "textureURL": "http://localhost:8000/assets/capes/null.png",
    "staticURL": "http://localhost:8000/assets/capes/null.png",
    "animatedCape": false
}
```

### Fields

| Field          | Type    | Description                                      |
|----------------|---------|--------------------------------------------------|
| `textureURL`   | string  | URL to the player's cape PNG texture             |
| `staticURL`    | string  | URL to the player's static cape PNG texture      |
| `animatedCape` | boolean | Whether the cape is animated (always `false` currently) |

### Errors

| Status | Condition                                           |
|--------|-----------------------------------------------------|
| 500    | Filesystem read failure or unexpected server error  |

## Example

```bash
curl http://localhost:8000/profile/Notch
```
