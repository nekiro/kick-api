# Kick API Client Examples

This directory contains practical examples of how to use the Kick API client.

## Examples Overview

### 1. Basic Usage (`basic-usage.ts`)

Complete example showing all API modules:

- Setting up the client with credentials
- Searching for categories
- Getting channel information
- Fetching live streams
- Sending chat messages (bot and user messages)
- Error handling

### 2. Bot Authentication (`bot-authentication.ts`)

Shows how to authenticate as a bot using client credentials flow:

- Automatic token management
- Server-to-server authentication
- Perfect for automated bots and background services

### 3. User Authentication (`user-authentication.ts`)

Demonstrates OAuth 2.1 with PKCE for user authentication:

- Authorization URL generation
- PKCE parameter handling
- Token exchange process
- Web server integration examples

### 4. Authentication Comparison (`authentication-comparison.ts`)

Comprehensive comparison between bot and user authentication:

- When to use each method
- Code examples side-by-side
- Feature comparison table
- Decision guide

## Running the Examples

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build the project:**

   ```bash
   npm run build
   ```

3. **Set up your credentials:**
   - Option A: Set environment variables
     ```bash
     export KICK_CLIENT_ID="your-client-id"
     export KICK_CLIENT_SECRET="your-client-secret"
     ```
   - Option B: Edit the `basic-usage.ts` file and replace the placeholder values

4. **Run the examples:**

   ```bash
   # Basic API usage
   npx ts-node examples/basic-usage.ts

   # Bot authentication
   npx ts-node examples/bot-authentication.ts

      # User authentication (interactive)
   npx ts-node examples/user-authentication.ts

   # Fully interactive user auth with step-by-step guidance
   npx ts-node examples/interactive-user-auth.ts

   # Compare authentication methods
   npx ts-node examples/authentication-comparison.ts

   # OAuth troubleshooting (for redirect URI errors)
   npx ts-node examples/oauth-troubleshooting.ts

   # Debug token exchange issues
   npx ts-node examples/debug-token-exchange.ts
   ```

### Expected Output

The example will:

- ✅ Authenticate with the Kick API
- 📂 Search for gaming categories
- 📺 List channels with high viewer counts
- 🎥 Show currently live gaming streams
- 💬 Send test chat messages as a bot
- 📝 Demonstrate reply messages

## Authentication Methods

### Bot Authentication (Client Credentials)

Perfect for automated bots and server-to-server applications:

```typescript
// No redirectUri = automatic bot authentication
const botClient = new client({
	clientId: "your-client-id",
	clientSecret: "your-client-secret",
	debug: true, // Optional, enables request/response logging
});

// Tokens are handled automatically
await botClient.chat.postMessage({
	type: "bot",
	content: "Hello from bot!",
});
```

### User Authentication (OAuth 2.1 + PKCE)

For applications that act on behalf of users:

```typescript
// With redirectUri = OAuth user authentication
const userClient = new client({
	clientId: "your-client-id",
	clientSecret: "your-client-secret",
	redirectUri: "http://localhost:3000/callback", // Required for user auth
	debug: true, // Optional, enables request/response logging
});

// Generate OAuth URL
const pkceParams = userClient.generatePKCEParams();
const authUrl = userClient.getAuthorizationUrl(pkceParams, ["public", "chat:write"]);

// After user authorizes and you get the code:
const token = await userClient.exchangeCodeForToken({
	code: authorizationCode,
	codeVerifier: pkceParams.codeVerifier,
});

// Now you can send messages as the user
await userClient.chat.postMessage({
	type: "user",
	broadcaster_user_id: 12345,
	content: "Hello from user!",
});
```

## Configuration Options

All configuration options available:

```typescript
const client = new client({
	clientId: "your-client-id", // Required
	clientSecret: "your-client-secret", // Required
	redirectUri: "http://localhost:3000/callback", // Optional, enables user auth
	baseUrl: "https://api.kick.com", // Optional, defaults to official API
	oauthUrl: "https://id.kick.com", // Optional, defaults to official OAuth
	debug: true, // Optional, enables request/response logging
});
```

## Chat Message Types

### Bot Messages

Bot messages are sent to the channel associated with your OAuth token:

```typescript
await client.chat.postMessage({
	type: "bot",
	content: "Hello from my bot! 🤖",
	reply_to_message_id: "optional-message-id", // Optional
});
```

### User Messages

User messages require a broadcaster user ID:

```typescript
await client.chat.postMessage({
	type: "user",
	broadcaster_user_id: 12345, // Required for user messages
	content: "Thanks for the great stream!",
	reply_to_message_id: "optional-message-id", // Optional
});
```

## Error Handling

The client throws specific error types that you can catch and handle:

```typescript
try {
	await client.chat.postMessage({
		type: "bot",
		content: "Test message",
	});
} catch (error) {
	if (error instanceof KickBadRequestError) {
		console.log("Validation error:", error.message);
	} else if (error instanceof KickNetworkError) {
		console.log("Network error:", error.message);
	} else if (error instanceof KickOAuthError) {
		console.log("Authentication error:", error.message);
	}
}
```

## Rate Limiting

Be aware that the Kick API has rate limits. If you encounter rate limiting errors:

- Implement exponential backoff
- Respect the `Retry-After` header if provided
- Consider caching responses when appropriate

## Getting Your Credentials

To use this client, you'll need to:

1. Create a Kick developer account
2. Create an application in the Kick developer portal
3. Note your Client ID and Client Secret
4. Configure the appropriate scopes (e.g., `chat:read`, `chat:write`)

## Need Help?

- Check the [Kick API Documentation](https://docs.kick.com/)
- Review the test files in the `test/` directory for more examples
- Open an issue on the project repository
