<div>
	<img src="/assets/kick.jpg" width="50" alt="kick-api" /> <h1>kick-api</h1>
</div>
</br>

[![npm package][npm-img]][npm-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]

> A zero-dependency TypeScript library for interacting with the [Kick.com API](https://docs.kick.com/apis). Features automatic OAuth 2.1 token management and a clean, intuitive interface.

## Features

- 🔒 **Automatic OAuth Management** - Handles token refresh automatically
- 📝 **Full TypeScript Support** - Types matching the current public Kick API
- 📄 **Cursor Pagination** - Categories v2 and Livestreams v2
- 🔔 **Webhooks** - Event subscriptions and RSA signature verification
- 🚀 **Zero Dependencies** - Uses built-in Node.js fetch
- 🎯 **Clean API** - Organized modules for different endpoints
- ⚡ **Modern** - Built for Node.js 20+ with native fetch and async/await

## Install

```bash
npm install @nekiro/kick-api
```

## Quick Start

You'll need kick developer app to use the API. **Read more at** https://docs.kick.com/getting-started/kick-apps-setup.

```typescript
import { client } from "@nekiro/kick-api";

const kickClient = new client({
	clientId: "your-client-id",
	clientSecret: "your-client-secret",
});

const channel = await kickClient.channels.getChannel("xqc");
console.log(channel.broadcaster_user_id, channel.stream_title);
```

An unknown slug rejects with `KickNotFoundError`. The public channel response does not contain a profile picture.
Do not substitute `banner_picture` for an avatar or wait for the channel to go live: fetch the user by
`broadcaster_user_id` with `users.getUser()`, which also works while the channel is offline.

## Current API

```typescript
// Cursor-paginated categories and livestreams
const categories = await kickClient.categories.getCategoriesV2({ name: ["Just Chatting"] });
const livestreams = await kickClient.livestreams.getLivestreamsV2({
	language_code: ["en"],
	limit: 100,
});

// User profile picture
const user = await kickClient.users.getUser(channel.broadcaster_user_id);
console.log(user?.profile_picture);

// Webhook subscriptions
await kickClient.events.subscribe({
	broadcaster_user_id: channel.broadcaster_user_id,
	events: [{ name: "chat.message.sent", version: 1 }],
});
```

For webhook replay protection, verify the signature, require a fresh timestamp with
`isWebhookTimestampFresh()`, and persist `Kick-Event-Message-Id` values as idempotency keys.

`getCategories()`, `getCategory()` and `getLivestreams()` target deprecated Kick v1 endpoints and remain available
for compatibility. New integrations should use their v2 counterparts.

## Examples

The `examples/` directory contains comprehensive, runnable examples for all authentication methods and API usage patterns:

### 🚀 **Quick Start Examples**

```bash
# Basic API usage with all modules
npx ts-node examples/basic-usage.ts

# Bot authentication (automatic)
npx ts-node examples/bot-authentication.ts

# Interactive user authentication
npx ts-node examples/user-authentication.ts
```

### 📚 **Available Examples**

| Example                          | Description                  | Use Case                  |
| -------------------------------- | ---------------------------- | ------------------------- |
| **basic-usage.ts**               | Complete API showcase        | Learning all endpoints    |
| **bot-authentication.ts**        | Client credentials flow      | Automated bots, servers   |
| **user-authentication.ts**       | Interactive OAuth 2.1 + PKCE | User-facing applications  |
| **interactive-user-auth.ts**     | Enhanced OAuth experience    | Step-by-step user auth    |
| **authentication-comparison.ts** | Bot vs User auth guide       | Choosing the right method |
| **oauth-troubleshooting.ts**     | Fix redirect URI errors      | Debugging OAuth issues    |
| **debug-token-exchange.ts**      | Token exchange debugging     | Fixing auth failures      |

### 🎯 **Authentication Methods**

**Bot Authentication** (Server-to-Server):

```typescript
// Automatic token management
const botClient = new client({
	clientId: "your-client-id",
	clientSecret: "your-client-secret",
	// No redirectUri = bot mode
});

await botClient.chat.postMessage({
	type: "bot",
	content: "Hello from bot!",
});
```

**User Authentication** (OAuth 2.1):

```typescript
// User permission-based
const userClient = new client({
	clientId: "your-client-id",
	clientSecret: "your-client-secret",
	redirectUri: "http://localhost:3000/callback",
});

// Generate OAuth URL
const pkceParams = userClient.generatePKCEParams();
const authUrl = userClient.getAuthorizationUrl(pkceParams, ["user:read", "chat:write"]);

// Exchange code for token
const token = await userClient.exchangeCodeForToken({
	code: authorizationCode,
	codeVerifier: pkceParams.codeVerifier,
});
```

### 🛠️ **Troubleshooting Tools**

Got OAuth errors? Use our built-in debugging tools:

```bash
# Fix "invalid redirect uri" errors
npx ts-node examples/oauth-troubleshooting.ts

# Debug token exchange failures
npx ts-node examples/debug-token-exchange.ts
```

### 📖 **Learn More**

See the complete examples documentation: [`examples/README.md`](examples/README.md)

## Error Handling

The library provides specific error classes for different types of failures:

```typescript
import {
	client,
	KickOAuthError,
	KickBadRequestError,
	KickUnauthorizedError,
	KickNotFoundError,
	KickRateLimitError,
} from "@nekiro/kick-api";

try {
	const result = await kickClient.categories.getCategories({ q: "gaming" });
} catch (error) {
	if (error instanceof KickOAuthError) {
		console.log("OAuth failed:", error.responseBody);
	} else if (error instanceof KickBadRequestError) {
		console.log("Bad request:", error.responseBody);
	} else if (error instanceof KickRateLimitError) {
		console.log("Rate limited, retry after:", error.retryAfter, "seconds");
	}
}
```

## Testing

```bash
# Run unit tests
npm test
```

[downloads-img]: https://img.shields.io/npm/dt/@nekiro/kick-api
[downloads-url]: https://www.npmtrends.com/@nekiro/kick-api
[npm-img]: https://img.shields.io/npm/v/@nekiro/kick-api
[npm-url]: https://www.npmjs.com/package/@nekiro/kick-api
[issues-img]: https://img.shields.io/github/issues/nekiro/kick-api
[issues-url]: https://github.com/nekiro/kick-api/issues
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
