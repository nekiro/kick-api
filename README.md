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
