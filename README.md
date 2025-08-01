<div>
	<img src="/assets/kick.jpg" width="50" alt="kick-api" /> <h1>kick-api</h1>
</div>
</br>

[![npm package][npm-img]][npm-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> A zero-dependency TypeScript library for interacting with the [Kick.com API](https://docs.kick.com/apis). Features automatic OAuth 2.1 token management and a clean, intuitive interface.

## Features

- 🔒 **Automatic OAuth Management** - Handles token refresh automatically
- 📝 **Full TypeScript Support** - Complete type definitions for all API responses
- 🚀 **Zero Dependencies** - Uses built-in Node.js fetch
- 🎯 **Clean API** - Organized modules for different endpoints
- ⚡ **Modern** - Built with async/await and ES modules

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
```

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
const authUrl = userClient.getAuthorizationUrl(pkceParams, ["public", "chat:write"]);

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
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
