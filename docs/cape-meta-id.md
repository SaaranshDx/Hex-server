# GET /cape/meta/:id

Retrieve metadata for a specific cape by its ID.

## Request

**Method:** `GET`  
**URL:** `/cape/meta/{capeId}`

### URL Parameters

| Parameter | Type   | Required | Description            |
|-----------|--------|----------|------------------------|
| `id`      | string | yes      | The cape ID to look up |

## Response

### Success (200)

If the cape has a metadata file (`cape_meta/{capeId}.json`):

```json
{
    "category": "Community",
    "playerpermission": ["player1"],
    "authorId": "1189872646163284041",
    "authorName": "PlayerName"
}
```

If no metadata file exists, a default response is returned:

```json
{
    "category": "Hex",
    "playerpermission": ["*"],
    "authorId": 1189872646163284041,
    "authorName": "Hex Development Team"
}
```

### Fields

| Field              | Type            | Description                              |
|--------------------|-----------------|------------------------------------------|
| `category`         | string          | `Community`, `Partner`, `Hex`, `Staff`, or `Mojang` |
| `playerpermission` | string[]        | IGNs allowed to use this cape, or `["*"]` for everyone |
| `authorId`         | string or int   | Discord user ID of the uploader          |
| `authorName`       | string          | IGN of the uploader                      |

### Errors

| Status | Condition                                         |
|--------|---------------------------------------------------|
| 500    | Filesystem read failure or invalid JSON in metadata file |

## Example

```bash
curl http://localhost:8000/cape/meta/1490
```
