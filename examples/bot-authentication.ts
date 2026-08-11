/**
 * Bot Authentication Example
 *
 * This example shows how to authenticate as a bot using client credentials flow.
 * Bot tokens are automatically handled by the client - you just need to provide
 * your client credentials without a redirectUri.
 *
 * Bot authentication is perfect for:
 * - Server-to-server applications
 * - Automated bots
 * - Background services
 * - Any application that doesn't need user permission
 */

import { client } from "../src";
import dotenv from "dotenv";

dotenv.config();

// Bot configuration - NO redirectUri means client credentials flow
const CLIENT_ID = process.env.KICK_CLIENT_ID || "your-client-id";
const CLIENT_SECRET = process.env.KICK_CLIENT_SECRET || "your-client-secret";

async function botAuthenticationExample() {
	console.log("🤖 Bot Authentication Example");
	console.log("===============================\n");

	// Create client for bot authentication
	// Key: NO redirectUri = automatic client credentials flow
	const botClient = new client({
		clientId: CLIENT_ID,
		clientSecret: CLIENT_SECRET,
		debug: true, // See the authentication process
	});

	try {
		console.log("1. Creating bot client (client credentials flow)...");

		// The bot token is automatically obtained when you make your first API call
		// The client will:
		// 1. Detect no redirectUri is set
		// 2. Use client credentials flow
		// 3. Get a bot access token
		// 4. Cache and auto-refresh the token

		console.log("\n2. Making first API call (triggers automatic authentication)...");

		const categories = await botClient.categories.getCategoriesV2({ name: ["gaming"] });
		console.log(`✅ Successfully authenticated! Found ${categories.data.length} categories.`);

		console.log("\n3. Sending a chat message as bot...");

		// Bot messages are sent to the channel associated with your bot token
		const chatResult = await botClient.chat.postMessage({
			type: "bot",
			content: "🤖 Hello! I'm authenticated as a bot using client credentials flow!",
		});

		console.log(`✅ Bot message sent! Message ID: ${chatResult.message_id}`);

		console.log("\n4. Making additional API calls (reuses cached token)...");

		// Subsequent calls will reuse the cached token
		const livestreams = await botClient.livestreams.getLivestreamsV2({
			category_id: [1], // Gaming category
			limit: 10,
		});

		console.log(`✅ Found ${livestreams.data.length} live streams (using cached token)`);

		console.log("\n🎉 Bot authentication example completed successfully!");
		console.log("\nKey points about bot authentication:");
		console.log("• No user interaction required");
		console.log("• Tokens are automatically managed");
		console.log("• Perfect for server-to-server applications");
		console.log("• Bot messages go to your bot's associated channel");
		console.log("• Tokens are automatically refreshed when needed");
	} catch (error) {
		console.error("\n❌ Bot authentication failed:");

		if (error instanceof Error) {
			console.error(`• Error: ${error.message}`);

			if ("status" in error) {
				console.error(`• HTTP Status: ${(error as any).status}`);
			}

			if ("responseBody" in error) {
				console.error(`• Response: ${JSON.stringify((error as any).responseBody, null, 2)}`);
			}
		}

		console.log("\n🔧 Troubleshooting:");
		console.log("• Verify your CLIENT_ID and CLIENT_SECRET are correct");
		console.log("• Make sure your app has the necessary scopes (chat:write, etc.)");
		console.log("• Check your app is configured for client credentials flow");
		console.log("• Ensure your bot is associated with a channel");
	}
}

// Advanced bot authentication with manual token inspection
async function inspectBotToken() {
	console.log("\n\n🔍 Advanced: Manual Token Inspection");
	console.log("=====================================\n");

	const botClient = new client({
		clientId: CLIENT_ID,
		clientSecret: CLIENT_SECRET,
		debug: true,
	});

	try {
		// Make a simple API call to trigger authentication
		await botClient.categories.getCategories({ q: "test" });

		// Access the token (note: this is accessing private properties for demo purposes)
		// In real applications, you typically don't need to access tokens directly
		const clientAny = botClient as any;
		if (clientAny.token) {
			console.log("📋 Current bot token information:");
			console.log(`• Token Type: ${clientAny.token.tokenType}`);
			console.log(`• Expires In: ${clientAny.token.expiresIn} seconds`);
			console.log(`• Expires At: ${new Date(clientAny.token.expiresAt).toISOString()}`);
			console.log(`• Scope: ${clientAny.token.scope || "Not specified"}`);
			console.log(`• Has Refresh Token: ${!!clientAny.token.refreshToken}`);
		}
	} catch (error) {
		console.error("Failed to inspect token:", error);
	}
}

// Run the examples
if (require.main === module) {
	botAuthenticationExample()
		.then(() => inspectBotToken())
		.catch(console.error);
}

export { botAuthenticationExample, inspectBotToken };
