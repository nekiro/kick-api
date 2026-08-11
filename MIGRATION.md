# Migrating from 2.x to 3.0

Version 3.0 aligns the client and its public types with the current Kick Public API. The changes below may require updates in applications compiled against 2.x.

## Channel fields

`Channel` now reflects the v1 response returned by Kick. Replace legacy field access as follows:

| 2.x field | 3.0 field or replacement |
| --- | --- |
| `channel.user_id` | `channel.broadcaster_user_id` |
| `channel.id` | `channel.broadcaster_user_id` |
| `channel.playback_url` | `channel.stream?.playback_url` |
| nested user/avatar data | `client.users.getUser(channel.broadcaster_user_id)` |

The type also exposes `stream_title`, `category`, `stream`, and `banner_picture`, matching the public API response.

`channels.getChannel(slug)` throws `KickNotFoundError` when Kick returns no matching channel. Catch that error when a missing handle is an expected result.

## OAuth tokens and scopes

Tokens are now a discriminated union. When restoring a serialized token with `setToken`, include `kind: "app"` or `kind: "user"`. User tokens require a `refreshToken`; app tokens do not expose one.

Scope names now use the values documented by Kick. Replace obsolete values such as `public`, `chat:read`, and `channels:read` with the appropriate `KickScope`, for example `user:read`, `channel:read`, or `chat:write`.

## Current API endpoints

Kick deprecated the v1 category and livestream listing endpoints. Migrate to:

- `categories.getCategoriesV2()`; use `getCategoriesV2({ id: [categoryId] })` to select a category by ID
- `livestreams.getLivestreamsV2()` for cursor-paginated discovery
- `livestreams.getLivestreamsByUserIds()` for specific broadcasters

Paginated methods return the complete envelope, so read records from `.data` and the continuation cursor from `.pagination.next_cursor`.

## New API coverage

The client now exposes users, moderation, event subscriptions, channel rewards, kicks leaderboards, the public key endpoint, chat-message deletion, OAuth token revocation/introspection, and typed webhook payloads. Webhook signatures can be checked with `events.verifyWebhookSignature()`.

Successful `204 No Content` responses now resolve normally instead of failing JSON parsing.
