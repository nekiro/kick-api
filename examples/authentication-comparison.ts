/**
 * Authentication Methods Comparison
 *
 * This example demonstrates the differences between bot and user authentication
 * and helps you choose the right method for your use case.
 */

import { client } from "../src";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.KICK_CLIENT_ID || "your-client-id";
const CLIENT_SECRET = process.env.KICK_CLIENT_SECRET || "your-client-secret";
const REDIRECT_URI = process.env.KICK_REDIRECT_URI || "http://localhost:3000/callback";

async function compareAuthenticationMethods() {
	console.log("🔐 Authentication Methods Comparison");
	console.log("====================================\n");

	// Bot Authentication (Client Credentials)
	console.log("🤖 BOT AUTHENTICATION (Client Credentials Flow)");
	console.log("-".repeat(50));
	console.log("✅ Pros:");
	console.log("  • Fully automated - no user interaction needed");
	console.log("  • Perfect for server-to-server applications");
	console.log("  • Tokens automatically managed and refreshed");
	console.log("  • Simple setup - just client ID and secret");
	console.log("  • Great for bots, scheduled tasks, webhooks");
	console.log("");
	console.log("❌ Cons:");
	console.log("  • Limited permissions (bot-level only)");
	console.log("  • Cannot act on behalf of users");
	console.log("  • Chat messages limited to bot's channel");
	console.log("  • No access to user-specific data");
	console.log("");
	console.log("🎯 Best for:");
	console.log("  • Automated chat bots");
	console.log("  • Server monitoring tools");
	console.log("  • Data collection services");
	console.log("  • Background processing");
	console.log("");

	// User Authentication (OAuth 2.1)
	console.log("👤 USER AUTHENTICATION (OAuth 2.1 + PKCE Flow)");
	console.log("-".repeat(50));
	console.log("✅ Pros:");
	console.log("  • Full user permissions (what they grant)");
	console.log("  • Can send messages to any channel user has access to");
	console.log("  • Access to user-specific data");
	console.log("  • Can perform actions on user's behalf");
	console.log("  • Secure with PKCE protection");
	console.log("");
	console.log("❌ Cons:");
	console.log("  • Requires user interaction and consent");
	console.log("  • More complex setup (OAuth flow)");
	console.log("  • Need to handle redirects and callbacks");
	console.log("  • Token management more complex");
	console.log("  • Requires web server for callback handling");
	console.log("");
	console.log("🎯 Best for:");
	console.log("  • Web applications");
	console.log("  • Mobile apps");
	console.log("  • Desktop applications");
	console.log("  • User-facing tools");
	console.log("");

	// Side-by-side code comparison
	console.log("📝 CODE COMPARISON");
	console.log("-".repeat(50));
	console.log("");

	console.log("Bot Authentication Setup:");
	console.log("```typescript");
	console.log("// Simple - just credentials needed");
	console.log("const botClient = new client({");
	console.log("  clientId: 'your-client-id',");
	console.log("  clientSecret: 'your-client-secret',");
	console.log("  // No redirectUri = automatic bot mode");
	console.log("});");
	console.log("");
	console.log("// Immediate usage - tokens handled automatically");
	console.log("const result = await botClient.chat.postMessage({");
	console.log("  type: 'bot',");
	console.log("  content: 'Hello from bot!',");
	console.log("});");
	console.log("```\n");

	console.log("User Authentication Setup:");
	console.log("```typescript");
	console.log("// More complex - requires OAuth flow");
	console.log("const userClient = new client({");
	console.log("  clientId: 'your-client-id',");
	console.log("  clientSecret: 'your-client-secret',");
	console.log("  redirectUri: 'http://localhost:3000/callback',");
	console.log("});");
	console.log("");
	console.log("// Step 1: Generate authorization URL");
	console.log("const pkceParams = userClient.generatePKCEParams();");
	console.log("const authUrl = userClient.getAuthorizationUrl(pkceParams, [");
	console.log("  'public', 'chat:write'");
	console.log("]);");
	console.log("");
	console.log("// Step 2: Redirect user to authUrl");
	console.log("// Step 3: Handle callback with authorization code");
	console.log("const token = await userClient.exchangeCodeForToken({");
	console.log("  code: authCodeFromCallback,");
	console.log("  codeVerifier: pkceParams.codeVerifier,");
	console.log("});");
	console.log("");
	console.log("// Step 4: Now can make API calls");
	console.log("const result = await userClient.chat.postMessage({");
	console.log("  type: 'user',");
	console.log("  broadcaster_user_id: 12345,");
	console.log("  content: 'Hello from user!',");
	console.log("});");
	console.log("```\n");

	// Feature comparison table
	console.log("📊 FEATURE COMPARISON");
	console.log("-".repeat(50));
	console.log("| Feature                | Bot Auth | User Auth |");
	console.log("|------------------------|----------|-----------|");
	console.log("| Setup Complexity       | Simple   | Complex   |");
	console.log("| User Interaction       | None     | Required  |");
	console.log("| Permissions            | Bot-only | User-level|");
	console.log("| Chat Channels          | Bot's    | User's    |");
	console.log("| Auto Token Refresh     | Yes      | Yes       |");
	console.log("| Web Server Required    | No       | Yes       |");
	console.log("| Suitable for Bots      | Perfect  | Overkill  |");
	console.log("| Suitable for User Apps | No       | Perfect   |");
	console.log("");

	// Decision guide
	console.log("🤔 WHICH ONE SHOULD YOU CHOOSE?");
	console.log("-".repeat(50));
	console.log("");
	console.log("Choose BOT AUTHENTICATION if:");
	console.log("  ✓ Building an automated bot");
	console.log("  ✓ Server-to-server communication");
	console.log("  ✓ No user interaction needed");
	console.log("  ✓ Simple setup preferred");
	console.log("  ✓ Bot permissions are sufficient");
	console.log("");
	console.log("Choose USER AUTHENTICATION if:");
	console.log("  ✓ Building a user-facing application");
	console.log("  ✓ Need to act on behalf of users");
	console.log("  ✓ Users should control their own permissions");
	console.log("  ✓ Need access to user-specific data");
	console.log("  ✓ Want users to send messages to various channels");
	console.log("");

	// Hybrid approach
	console.log("🔄 HYBRID APPROACH");
	console.log("-".repeat(50));
	console.log("You can also use BOTH in the same application:");
	console.log("");
	console.log("```typescript");
	console.log("// Bot client for automated tasks");
	console.log("const botClient = new client({");
	console.log("  clientId: process.env.CLIENT_ID,");
	console.log("  clientSecret: process.env.CLIENT_SECRET,");
	console.log("});");
	console.log("");
	console.log("// User client for user-facing features");
	console.log("const userClient = new client({");
	console.log("  clientId: process.env.CLIENT_ID,");
	console.log("  clientSecret: process.env.CLIENT_SECRET,");
	console.log("  redirectUri: 'http://localhost:3000/callback',");
	console.log("});");
	console.log("");
	console.log("// Use bot for automated notifications");
	console.log("await botClient.chat.postMessage({");
	console.log("  type: 'bot',");
	console.log("  content: 'System: Server maintenance in 5 minutes',");
	console.log("});");
	console.log("");
	console.log("// Use user client for user actions");
	console.log("await userClient.chat.postMessage({");
	console.log("  type: 'user',");
	console.log("  broadcaster_user_id: userId,");
	console.log("  content: userMessage,");
	console.log("});");
	console.log("```");
}

// Demonstrate actual bot vs user client creation
async function demonstrateClientTypes() {
	console.log("\n\n🧪 LIVE DEMONSTRATION");
	console.log("======================\n");

	try {
		console.log("Creating bot client...");
		const botClient = new client({
			clientId: CLIENT_ID,
			clientSecret: CLIENT_SECRET,
			// No redirectUri = bot mode
		});
		console.log("✅ Bot client created successfully");

		console.log("\nCreating user client...");
		const userClient = new client({
			clientId: CLIENT_ID,
			clientSecret: CLIENT_SECRET,
			redirectUri: REDIRECT_URI, // With redirectUri = user mode
		});
		console.log("✅ User client created successfully");

		console.log("\nTesting bot client (should work immediately)...");
		try {
			await botClient.categories.getCategories({ q: "test" });
			console.log("✅ Bot client authenticated automatically");
		} catch {
			console.log("❌ Bot client authentication failed");
			console.log("   (Check your credentials)");
		}

		console.log("\nTesting user client (should require OAuth)...");
		try {
			await userClient.categories.getCategories({ q: "test" });
			console.log("❌ This shouldn't happen - user client needs OAuth");
		} catch {
			console.log("✅ User client correctly requires OAuth flow");
			console.log("   (This is expected behavior)");
		}

		console.log("\nGenerating OAuth URL for user client...");
		const pkceParams = userClient.generatePKCEParams();
		const authUrl = userClient.getAuthorizationUrl(pkceParams, ["public"]);
		console.log("✅ OAuth URL generated successfully");
		console.log(`   URL: ${authUrl.substring(0, 60)}...`);
	} catch (error) {
		console.error("Demonstration failed:", error);
	}
}

// Run the comparison
if (require.main === module) {
	compareAuthenticationMethods()
		.then(() => demonstrateClientTypes())
		.catch(console.error);
}

export { compareAuthenticationMethods, demonstrateClientTypes };
