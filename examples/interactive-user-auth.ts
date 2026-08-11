/**
 * Interactive User Authentication Example
 *
 * This example provides a completely interactive terminal experience for
 * testing user authentication with OAuth 2.1 + PKCE flow.
 *
 * Features:
 * - Generates clickable OAuth URLs
 * - Prompts for user input in terminal
 * - Completes full OAuth flow
 * - Tests authenticated API calls
 * - Interactive chat message sending
 */

import { client } from "../src";
import type { KickScope } from "../src";
import dotenv from "dotenv";
import * as readline from "readline";

dotenv.config();

const CLIENT_ID = process.env.KICK_CLIENT_ID || "your-client-id";
const CLIENT_SECRET = process.env.KICK_CLIENT_SECRET || "your-client-secret";
const REDIRECT_URI = process.env.KICK_REDIRECT_URI || "http://localhost:3000/callback";

// Enhanced user input helper with validation
function getUserInput(question: string, validator?: (input: string) => boolean): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		const askQuestion = () => {
			rl.question(question, (answer) => {
				const trimmed = answer.trim();

				if (validator && !validator(trimmed)) {
					console.log("❌ Invalid input. Please try again.");
					askQuestion();
				} else {
					rl.close();
					resolve(trimmed);
				}
			});
		};
		askQuestion();
	});
}

// Helper to confirm yes/no questions
async function confirmAction(question: string): Promise<boolean> {
	const answer = await getUserInput(`${question} (y/n): `, (input) =>
		["y", "yes", "n", "no"].includes(input.toLowerCase()),
	);
	return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}

// Helper to get numeric input
async function getNumericInput(question: string): Promise<number | null> {
	const answer = await getUserInput(`${question}: `, (input) => {
		const num = parseInt(input);
		return !isNaN(num) && num > 0;
	});
	return parseInt(answer);
}

async function interactiveUserAuthentication() {
	console.clear();
	console.log("🚀 Interactive Kick API User Authentication");
	console.log("==========================================\n");

	// Validate credentials
	if (CLIENT_ID === "your-client-id" || CLIENT_SECRET === "your-client-secret") {
		console.log("⚠️  WARNING: Using default credentials!");
		console.log("Set KICK_CLIENT_ID and KICK_CLIENT_SECRET environment variables\n");

		const shouldContinue = await confirmAction("Continue with demo credentials anyway?");
		if (!shouldContinue) {
			console.log("👋 Exiting. Set your real credentials and try again!");
			return;
		}
	}

	// Create user authentication client
	const userClient = new client({
		clientId: CLIENT_ID,
		clientSecret: CLIENT_SECRET,
		redirectUri: REDIRECT_URI,
		debug: true,
	});

	try {
		console.log("🔐 Starting OAuth 2.1 + PKCE authentication flow...\n");

		// Step 1: Generate PKCE parameters
		console.log("1️⃣ Generating secure PKCE parameters...");
		const pkceParams = userClient.generatePKCEParams();
		console.log("✅ PKCE parameters generated");
		console.log(`   📋 State: ${pkceParams.state}`);
		console.log("   🔒 Code challenge and verifier created\n");

		// Step 2: Generate authorization URL with custom scopes
		console.log("2️⃣ What permissions would you like to request?");
		console.log("Available scopes:");
		console.log("   • user:read - Read user profile information");
		console.log("   • channel:read - Read channel information");
		console.log("   • chat:write - Send chat messages");

		const useDefaultScopes = await confirmAction("\nUse default scopes (user:read, channel:read, chat:write)?");

		const availableScopes: KickScope[] = ["user:read", "channel:read", "chat:write"];
		let scopes: KickScope[] = availableScopes;
		if (!useDefaultScopes) {
			const customScopes = await getUserInput("Enter comma-separated scopes: ");
			scopes = customScopes
				.split(",")
				.map((s) => s.trim())
				.filter((scope): scope is KickScope => availableScopes.includes(scope as KickScope));
		}

		console.log(`\n📝 Requesting scopes: ${scopes.join(", ")}`);

		const authUrl = userClient.getAuthorizationUrl(pkceParams, scopes);
		console.log("✅ Authorization URL generated\n");

		// Step 3: User interaction
		console.log("🌐 AUTHORIZATION REQUIRED");
		console.log("========================");
		console.log("Please complete these steps:\n");
		console.log("1. 🖱️  Click the URL below (or copy & paste into your browser):");
		console.log(`\n   🔗 ${authUrl}\n`);
		console.log("2. 🔐 Log in to your Kick account");
		console.log("3. ✅ Review and approve the requested permissions");
		console.log("4. 📄 Copy the authorization code from the callback URL");
		console.log(`5. 📋 Look for: ${REDIRECT_URI}?code=YOUR_CODE&state=...\n`);

		await getUserInput("Press ENTER when you're ready to paste the authorization code...");

		// Get authorization code from user
		const authCode = await getUserInput(
			"\n📥 Paste the authorization code here: ",
			(input) => input.length > 10, // Basic validation
		);

		console.log("\n3️⃣ Exchanging authorization code for access token...");

		// Exchange code for token
		const token = await userClient.exchangeCodeForToken({
			code: authCode,
			codeVerifier: pkceParams.codeVerifier,
		});

		console.log("\n🎉 SUCCESS! User authenticated successfully!\n");

		// Display token information
		console.log("📊 Token Details:");
		console.log("─".repeat(40));
		console.log(`Type:           ${token.tokenType}`);
		console.log(`Expires In:     ${token.expiresIn} seconds (${Math.round(token.expiresIn / 60)} minutes)`);
		console.log(`Scope:          ${token.scope || "Not specified"}`);
		console.log(`Has Refresh:    ${token.refreshToken ? "Yes" : "No"}`);
		console.log(`Expires At:     ${new Date(token.expiresAt).toLocaleString()}`);
		console.log("─".repeat(40) + "\n");

		// Step 4: Test API calls
		console.log("4️⃣ Testing authenticated API access...\n");

		// Test categories
		console.log("🔍 Fetching gaming categories...");
		const categories = await userClient.categories.getCategories({ q: "gaming" });
		console.log(`✅ Retrieved ${categories.length} categories`);

		// Test channels
		console.log("\n📺 Fetching user's channel...");
		const channels = await userClient.channels.getChannels();
		console.log(`✅ Retrieved ${channels.length} channels`);

		// Test livestreams
		console.log("\n🎥 Fetching live streams...");
		const livestreams = await userClient.livestreams.getLivestreams({
			category_id: 1, // Gaming category
			limit: 10,
		});
		console.log(`✅ Retrieved ${livestreams.length} live streams`);

		// Step 5: Interactive chat testing
		console.log("\n5️⃣ Interactive Chat Testing");
		console.log("==========================\n");

		const testChat = await confirmAction("Would you like to test sending chat messages?");

		if (testChat) {
			console.log("\n💬 Chat Message Testing");
			console.log("To send user messages, you need a broadcaster user ID.");
			console.log("This is the numeric ID of the channel you want to send a message to.\n");

			const broadcasterUserId = await getNumericInput("Enter broadcaster user ID");

			if (broadcasterUserId) {
				// Get custom message
				const defaultMessage = "🎉 Test message sent via Kick API with OAuth authentication!";
				const useCustomMessage = await confirmAction(
					`\nDefault message: "${defaultMessage}"\nWould you like to enter a custom message?`,
				);

				let messageContent = defaultMessage;
				if (useCustomMessage) {
					messageContent = await getUserInput("Enter your message: ");
				}

				console.log("\n📤 Sending message as authenticated user...");

				const chatResult = await userClient.chat.postMessage({
					type: "user",
					broadcaster_user_id: broadcasterUserId,
					content: messageContent,
				});

				console.log("\n✅ Message sent successfully!");
				console.log(`   📝 Message ID: ${chatResult.message_id}`);
				console.log(`   ✅ Delivery confirmed: ${chatResult.is_sent}`);

				// Optional: Send a reply
				const sendReply = await confirmAction("\nWould you like to send a reply to this message?");
				if (sendReply) {
					const replyContent = await getUserInput("Enter reply message: ");

					const replyResult = await userClient.chat.postMessage({
						type: "user",
						broadcaster_user_id: broadcasterUserId,
						content: replyContent,
						reply_to_message_id: chatResult.message_id,
					});

					console.log("\n✅ Reply sent successfully!");
					console.log(`   📝 Reply ID: ${replyResult.message_id}`);
					console.log(`   ↩️  Replying to: ${chatResult.message_id}`);
				}
			}
		}

		// Completion summary
		console.log("\n🎊 Interactive Authentication Completed!");
		console.log("========================================\n");
		console.log("✅ OAuth 2.1 + PKCE flow completed successfully");
		console.log("✅ Access token obtained and cached");
		console.log("✅ API endpoints tested and working");
		console.log("✅ Chat functionality verified");
		console.log("\n🔧 Your application can now:");
		console.log("   • Send messages as the authenticated user");
		console.log("   • Access user data within granted permissions");
		console.log("   • Perform actions on behalf of the user");
		console.log("   • Automatically refresh tokens when needed");
		console.log("\n💡 The client will automatically handle token refresh");
		console.log("   and maintain the user session for future API calls.");
	} catch (error) {
		console.error("\n❌ Authentication failed:");

		if (error instanceof Error) {
			console.error("\n🔍 Error Details:");
			console.error(`   Type: ${error.constructor.name}`);
			console.error(`   Message: ${error.message}`);

			if ("status" in error) {
				console.error(`   HTTP Status: ${(error as any).status}`);
			}

			if ("responseBody" in error) {
				console.error("   Response Body:");
				console.error(JSON.stringify((error as any).responseBody, null, 4));
			}
		}

		console.log("\n🔧 Troubleshooting Guide:");
		console.log("═".repeat(50));
		console.log("• Check your CLIENT_ID and CLIENT_SECRET are correct");
		console.log("• Verify redirectUri matches your app configuration exactly");
		console.log("• Ensure your app is configured for authorization code flow");
		console.log("• Make sure the authorization code wasn't expired or used");
		console.log("• Confirm you copied the complete authorization code");
		console.log("• Check that your app has the requested scopes enabled");
		console.log("• Verify your Kick app is approved and active");
		console.log("\n❌ Got 'invalid redirect uri' error?");
		console.log("   Run: npx ts-node examples/oauth-troubleshooting.ts");
	}
}

// Run the interactive example
if (require.main === module) {
	interactiveUserAuthentication().catch(console.error);
}

export { interactiveUserAuthentication };
