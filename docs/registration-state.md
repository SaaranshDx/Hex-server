# GET /registration-state/:username

Check whether a Minecraft username is registered in the system.

## Request

**Method:** `GET`  
**URL:** `/registration-state/{username}`

### URL Parameters

| Parameter  | Type   | Required | Description                   |
|------------|--------|----------|-------------------------------|
| `username` | string | yes      | Minecraft username (IGN) to check |

## Response

### Success (200)

If the user is registered (`user_meta/{username}.json` exists):

```
true
```

If the user is not registered:

```
false
```

The response is a plain string (`"true"` or `"false"`), not a JSON object.

### Errors

| Status | Condition                                           |
|--------|-----------------------------------------------------|
| 500    | Filesystem read failure or unexpected server error  |

## Example

```bash
curl http://localhost:8000/registration-state/Notch
```
