/**
 * User Authentication Example
 *
 * This example shows how to authenticate users using OAuth 2.1 with PKCE.
 * User authentication allows your application to act on behalf of a user
 * with their explicit permission.
 *
 * User authentication is perfect for:
 * - Web applications
 * - Desktop applications
 * - Mobile applications
 * - Any app that needs user-specific permissions
 *
 * This example simulates a web application flow.
 */

import { client } from "../src";
import dotenv from "dotenv";
import * as readline from "readline";

dotenv.config();

// User authentication configuration - MUST include redirectUri
const CLIENT_ID = process.env.KICK_CLIENT_ID || "your-client-id";
const CLIENT_SECRET = process.env.KICK_CLIENT_SECRET || "your-client-secret";
const REDIRECT_URI = process.env.KICK_REDIRECT_URI || "http://localhost:3000/callback";

// Helper function to get user input
function getUserInput(question: string): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

async function userAuthenticationExample() {
	console.log("👤 Interactive User Authentication Example (OAuth 2.1 + PKCE)");
	console.log("=============================================================\n");

	// Create client for user authentication
	// Key: WITH redirectUri = OAuth authorization code flow
	const userClient = new client({
		clientId: CLIENT_ID,
		clientSecret: CLIENT_SECRET,
		redirectUri: REDIRECT_URI,
		debug: true,
	});

	try {
		console.log("🔐 Starting interactive OAuth 2.1 flow...\n");

		// Step 1: Generate PKCE parameters for security
		console.log("1️⃣ Generating PKCE parameters...");
		const pkceParams = userClient.generatePKCEParams();
		console.log("✅ PKCE parameters generated securely");
		console.log(`   • State: ${pkceParams.state}`);
		console.log("   • Code challenge and verifier created\n");

		// Step 2: Generate authorization URL
		console.log("2️⃣ Generating authorization URL...");
		const authUrl = userClient.getAuthorizationUrl(pkceParams, ["public", "chat:read", "chat:write", "channels:read"]);
		console.log("✅ Authorization URL generated\n");

		// Step 3: User interaction
		console.log("🌐 AUTHORIZATION REQUIRED");
		console.log("========================");
		console.log("Please complete the following steps:");
		console.log("\n1. Click or copy this URL to authorize the application:");
		console.log(`\n   🔗 ${authUrl}\n`);
		console.log("2. Log in to your Kick account");
		console.log("3. Grant the requested permissions");
		console.log("4. You will be redirected to your callback URL with an authorization code");
		console.log(`5. Look for the 'code' parameter in the URL: ${REDIRECT_URI}?code=YOUR_CODE&state=...\n`);

		// Wait for user to complete OAuth flow
		console.log("⏳ Waiting for you to complete the authorization...\n");

		const authCode = await getUserInput("📝 Please paste the authorization code from the callback URL: ");

		if (!authCode) {
			console.log("❌ No authorization code provided. Exiting.");
			return;
		}

		console.log("\n3️⃣ Exchanging authorization code for access token...");

		// Step 4: Exchange code for token
		const token = await userClient.exchangeCodeForToken({
			code: authCode,
			codeVerifier: pkceParams.codeVerifier,
		});

		console.log("🎉 SUCCESS! User authenticated successfully!");
		console.log("\n📊 Token Information:");
		console.log(`   • Token Type: ${token.tokenType}`);
		console.log(`   • Expires In: ${token.expiresIn} seconds`);
		console.log(`   • Scope: ${token.scope || "Not specified"}`);
		console.log(`   • Has Refresh Token: ${!!token.refreshToken}`);
		console.log(`   • Expires At: ${new Date(token.expiresAt).toISOString()}\n`);

		// Step 5: Test the authenticated user client
		console.log("4️⃣ Testing authenticated API calls...\n");

		// Test basic API call
		console.log("🔍 Fetching categories as authenticated user...");
		const categories = await userClient.categories.getCategories({ q: "gaming" });
		console.log(`✅ Found ${categories.length} categories`);

		// Get broadcaster user ID for chat
		console.log("\n💬 Ready to send chat messages as the authenticated user!");
		console.log("Note: To send user messages, you need a broadcaster_user_id");

		const shouldSendMessage = await getUserInput("\nWould you like to send a test chat message? (y/n): ");

		if (shouldSendMessage.toLowerCase() === "y" || shouldSendMessage.toLowerCase() === "yes") {
			const broadcasterUserId = await getUserInput("Enter broadcaster user ID (numeric): ");

			if (broadcasterUserId && !isNaN(Number(broadcasterUserId))) {
				console.log("\n📤 Sending test message as authenticated user...");

				const chatResult = await userClient.chat.postMessage({
					type: "user",
					broadcaster_user_id: parseInt(broadcasterUserId),
					content: "🎉 Hello! This message was sent using OAuth user authentication!",
				});

				console.log("✅ User message sent successfully!");
				console.log(`   • Message ID: ${chatResult.message_id}`);
				console.log(`   • Was sent: ${chatResult.is_sent}`);
			} else {
				console.log("⏭️ Skipping chat message (invalid broadcaster ID)");
			}
		} else {
			console.log("⏭️ Skipping chat message test");
		}

		console.log("\n🎊 Interactive user authentication completed successfully!");
		console.log("\n📋 What you can do now:");
		console.log("   • Send messages as the authenticated user");
		console.log("   • Access user-specific data (within granted scopes)");
		console.log("   • Perform actions on behalf of the user");
		console.log("   • Token will be automatically refreshed when needed");
	} catch (error) {
		console.error("\n❌ User authentication failed:");

		if (error instanceof Error) {
			console.error(`   • Error: ${error.message}`);

			if ("status" in error) {
				console.error(`   • HTTP Status: ${(error as any).status}`);
			}

			if ("responseBody" in error) {
				console.error(`   • Response: ${JSON.stringify((error as any).responseBody, null, 2)}`);
			}
		}

		console.log("\n🔧 Troubleshooting:");
		console.log("   • Verify your CLIENT_ID and CLIENT_SECRET are correct");
		console.log("   • Make sure your redirectUri is registered in your Kick app");
		console.log("   • Ensure your app supports authorization code flow");
		console.log("   • Check that the redirectUri exactly matches your app configuration");
		console.log("   • Verify the authorization code wasn't expired or already used");
		console.log("   • Make sure you copied the complete authorization code");
		console.log("\n❌ Got 'invalid redirect uri' error?");
		console.log("   Run: npx ts-node examples/oauth-troubleshooting.ts");
		console.log("\n❌ Token exchange failed?");
		console.log("   Run: npx ts-node examples/debug-token-exchange.ts");
	}
}

// Example of a complete user authentication workflow
async function simulateCompleteUserFlow() {
	console.log("\n\n🔄 Complete User Authentication Workflow");
	console.log("=========================================\n");

	const userClient = new client({
		clientId: CLIENT_ID,
		clientSecret: CLIENT_SECRET,
		redirectUri: REDIRECT_URI,
		debug: true,
	});

	// This would be a real authorization code in a real application
	const SIMULATED_AUTH_CODE = "simulated_auth_code_from_kick";

	try {
		console.log("1. User clicks 'Login with Kick' button");

		const pkceParams = userClient.generatePKCEParams();
		const authUrl = userClient.getAuthorizationUrl(pkceParams, ["public", "chat:write"]);

		console.log("2. User redirected to Kick for authorization");
		console.log(`   ${authUrl.substring(0, 60)}...`);

		console.log("3. User grants permissions and is redirected back");
		console.log(`   ${REDIRECT_URI}?code=${SIMULATED_AUTH_CODE}&state=${pkceParams.state}`);

		console.log("4. Server extracts authorization code from callback");
		console.log(`   Authorization code: ${SIMULATED_AUTH_CODE}`);

		console.log("5. Server exchanges code for access token");
		console.log("   (This would succeed with a real authorization code)");

		// This will fail without a real code, but shows the process
		try {
			await userClient.exchangeCodeForToken({
				code: SIMULATED_AUTH_CODE,
				codeVerifier: pkceParams.codeVerifier,
			});
			console.log("✅ Token exchange successful!");
		} catch {
			console.log("❌ Token exchange failed (expected with simulated code)");
			console.log("   In real app: this would succeed with valid authorization code");
		}

		console.log("\n📋 After successful token exchange, you can:");
		console.log("• Send messages as the authenticated user");
		console.log("• Access user-specific data they've granted permission for");
		console.log("• Perform actions on their behalf");
		console.log("• Automatically refresh tokens when they expire");
	} catch (error) {
		console.error("Workflow simulation failed:", error);
	}
}

// Web server example for handling the OAuth callback
function createWebServerExample() {
	console.log("\n\n🌐 Web Server Integration Example");
	console.log("==================================\n");

	console.log("Here's how you'd integrate this into a web server:\n");

	console.log("```javascript");
	console.log("// Express.js example");
	console.log("const express = require('express');");
	console.log("const { client } = require('@nekiro/kick-api');");
	console.log("");
	console.log("const app = express();");
	console.log("const kickClient = new client({");
	console.log("  clientId: process.env.KICK_CLIENT_ID,");
	console.log("  clientSecret: process.env.KICK_CLIENT_SECRET,");
	console.log("  redirectUri: 'http://localhost:3000/auth/kick/callback',");
	console.log("});");
	console.log("");
	console.log("// Store PKCE params in session (use proper session storage in production)");
	console.log("const userSessions = new Map();");
	console.log("");
	console.log("// Start OAuth flow");
	console.log("app.get('/auth/kick', (req, res) => {");
	console.log("  const pkceParams = kickClient.generatePKCEParams();");
	console.log("  ");
	console.log("  // Store PKCE params in user session");
	console.log("  userSessions.set(req.sessionID, pkceParams);");
	console.log("  ");
	console.log("  const authUrl = kickClient.getAuthorizationUrl(pkceParams, [");
	console.log("    'public', 'chat:read', 'chat:write'");
	console.log("  ]);");
	console.log("  ");
	console.log("  res.redirect(authUrl);");
	console.log("});");
	console.log("");
	console.log("// Handle OAuth callback");
	console.log("app.get('/auth/kick/callback', async (req, res) => {");
	console.log("  try {");
	console.log("    const { code, state } = req.query;");
	console.log("    const pkceParams = userSessions.get(req.sessionID);");
	console.log("    ");
	console.log("    // Verify state for security");
	console.log("    if (state !== pkceParams.state) {");
	console.log("      throw new Error('State mismatch');");
	console.log("    }");
	console.log("    ");
	console.log("    // Exchange code for token");
	console.log("    const token = await kickClient.exchangeCodeForToken({");
	console.log("      code,");
	console.log("      codeVerifier: pkceParams.codeVerifier,");
	console.log("    });");
	console.log("    ");
	console.log("    // Store token in user session");
	console.log("    userSessions.set(req.sessionID, { ...pkceParams, token });");
	console.log("    ");
	console.log("    res.json({ success: true, message: 'Authentication successful!' });");
	console.log("  } catch (error) {");
	console.log("    res.status(400).json({ error: error.message });");
	console.log("  }");
	console.log("});");
	console.log("");
	console.log("// Use authenticated client for API calls");
	console.log("app.post('/chat/message', async (req, res) => {");
	console.log("  try {");
	console.log("    const session = userSessions.get(req.sessionID);");
	console.log("    if (!session?.token) {");
	console.log("      return res.status(401).json({ error: 'Not authenticated' });");
	console.log("    }");
	console.log("    ");
	console.log("    // Client will automatically use the stored token");
	console.log("    const result = await kickClient.chat.postMessage({");
	console.log("      type: 'user',");
	console.log("      broadcaster_user_id: req.body.broadcaster_user_id,");
	console.log("      content: req.body.content,");
	console.log("    });");
	console.log("    ");
	console.log("    res.json(result);");
	console.log("  } catch (error) {");
	console.log("    res.status(400).json({ error: error.message });");
	console.log("  }");
	console.log("});");
	console.log("```");
}

// Run the examples
if (require.main === module) {
	userAuthenticationExample()
		.then(() => simulateCompleteUserFlow())
		.then(() => createWebServerExample())
		.catch(console.error);
}

export { userAuthenticationExample, simulateCompleteUserFlow, createWebServerExample };
