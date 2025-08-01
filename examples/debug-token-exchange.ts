/**
 * Debug Token Exchange Issues
 *
 * This script helps debug problems with exchanging authorization codes for tokens.
 * It provides detailed logging and error information.
 */

import { client } from "../src";
import dotenv from "dotenv";
import * as readline from "readline";

dotenv.config();

const CLIENT_ID = process.env.KICK_CLIENT_ID || "your-client-id";
const CLIENT_SECRET = process.env.KICK_CLIENT_SECRET || "your-client-secret";
const REDIRECT_URI = process.env.KICK_REDIRECT_URI || "http://localhost:3000/callback";

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

async function debugTokenExchange() {
	console.clear();
	console.log("🔍 Debug Token Exchange Issues");
	console.log("===============================\n");

	// Show current configuration
	console.log("📋 Current Configuration:");
	console.log("─".repeat(40));
	console.log(`Client ID:     ${CLIENT_ID}`);
	console.log(`Client Secret: ${CLIENT_SECRET.substring(0, 8)}***`);
	console.log(`Redirect URI:  ${REDIRECT_URI}`);
	console.log("─".repeat(40) + "\n");

	// Create client with enhanced debugging
	const userClient = new client({
		clientId: CLIENT_ID,
		clientSecret: CLIENT_SECRET,
		redirectUri: REDIRECT_URI,
		debug: true, // This will show detailed HTTP requests
	});

	try {
		// Generate new PKCE parameters for testing
		console.log("1️⃣ Generating fresh PKCE parameters...");
		const pkceParams = userClient.generatePKCEParams();
		console.log("✅ PKCE parameters generated");
		console.log(`   State: ${pkceParams.state}`);
		console.log(`   Code Challenge: ${pkceParams.codeChallenge}`);
		console.log(`   Code Verifier: ${pkceParams.codeVerifier.substring(0, 10)}...`);

		// Generate authorization URL
		console.log("\n2️⃣ Generating authorization URL...");
		const authUrl = userClient.getAuthorizationUrl(pkceParams, ["public", "chat:read", "chat:write"]);
		console.log("✅ Authorization URL generated");

		// Check if user wants to use existing code or get new one
		const useExistingCode = await getUserInput("\nDo you have an authorization code to test? (y/n): ");

		let authCode: string;
		let userProvidedVerifier: string | null = null;

		if (useExistingCode.toLowerCase() === "y" || useExistingCode.toLowerCase() === "yes") {
			console.log("\n⚠️  IMPORTANT: Authorization codes expire quickly (usually 10 minutes)");
			console.log("Make sure your code is recent!\n");

			authCode = await getUserInput("Paste your authorization code: ");

			const hasVerifier = await getUserInput(
				"Do you have the code verifier from when this code was generated? (y/n): ",
			);
			if (hasVerifier.toLowerCase() === "y" || hasVerifier.toLowerCase() === "yes") {
				userProvidedVerifier = await getUserInput("Paste the code verifier: ");
			}
		} else {
			console.log("\n🌐 Get a fresh authorization code:");
			console.log("─".repeat(35));
			console.log("1. Click this URL to get a fresh code:");
			console.log(`   ${authUrl}\n`);
			console.log("2. Complete the authorization");
			console.log("3. Copy the code from the callback URL\n");

			authCode = await getUserInput("Paste the fresh authorization code: ");
		}

		// Use the appropriate code verifier
		const codeVerifier = userProvidedVerifier || pkceParams.codeVerifier;

		console.log("\n3️⃣ Attempting token exchange...");
		console.log("─".repeat(35));
		console.log(`Using code: ${authCode.substring(0, 20)}...`);
		console.log(`Using verifier: ${codeVerifier.substring(0, 10)}...`);
		console.log(`Expected state: ${userProvidedVerifier ? "Unknown (user provided)" : pkceParams.state}`);

		// Add extra debugging
		console.log("\n🔍 Token Exchange Debug Info:");
		console.log("This will show the actual HTTP request and response...\n");

		// Attempt token exchange with detailed error handling
		const token = await userClient.exchangeCodeForToken({
			code: authCode,
			codeVerifier: codeVerifier,
		});

		console.log("\n🎉 SUCCESS! Token exchange completed!");
		console.log("─".repeat(40));
		console.log(`Access Token: ${token.accessToken.substring(0, 20)}...`);
		console.log(`Token Type: ${token.tokenType}`);
		console.log(`Expires In: ${token.expiresIn} seconds`);
		console.log(`Scope: ${token.scope || "Not specified"}`);
		console.log(`Has Refresh Token: ${!!token.refreshToken}`);
		console.log(`Expires At: ${new Date(token.expiresAt).toISOString()}`);

		// Test the token by making an API call
		console.log("\n4️⃣ Testing the token with an API call...");
		const categories = await userClient.categories.getCategories({ q: "gaming" });
		console.log(`✅ Token works! Retrieved ${categories.length} categories`);
	} catch (error) {
		console.error("\n❌ Token exchange failed!");
		console.error("─".repeat(30));

		if (error instanceof Error) {
			console.error(`Error Type: ${error.constructor.name}`);
			console.error(`Message: ${error.message}`);

			// Show HTTP details if available
			if ("status" in error) {
				console.error(`HTTP Status: ${(error as any).status}`);
			}

			if ("responseBody" in error) {
				console.error("Response Body:");
				console.error(JSON.stringify((error as any).responseBody, null, 2));
			}
		}

		console.log("\n🔧 Common Token Exchange Issues:");
		console.log("━".repeat(40));
		console.log("1. 📅 Code Expired: Authorization codes expire in ~10 minutes");
		console.log("2. 🔄 Code Already Used: Each code can only be used once");
		console.log("3. 🔑 Wrong Verifier: Code verifier must match the challenge");
		console.log("4. 🚫 Invalid Client: Check CLIENT_ID and CLIENT_SECRET");
		console.log("5. 📍 Redirect Mismatch: URI must match exactly");
		console.log("6. 🌐 Network Issues: Check internet connection");

		console.log("\n🛠️ Troubleshooting Steps:");
		console.log("━".repeat(25));
		console.log("• Get a FRESH authorization code (< 5 minutes old)");
		console.log("• Use the SAME session (don't restart the app)");
		console.log("• Check your environment variables");
		console.log("• Verify client credentials in Kick developer dashboard");
		console.log("• Ensure redirect URI matches exactly");

		// Offer to try again with fresh code
		console.log("\n🔄 Want to try again with a fresh code?");
		const tryAgain = await getUserInput("Generate new URL and try again? (y/n): ");

		if (tryAgain.toLowerCase() === "y" || tryAgain.toLowerCase() === "yes") {
			console.log("\nStarting fresh token exchange process...\n");
			await debugTokenExchange();
		}
	}
}

// Additional debugging utilities
async function analyzeAuthCode() {
	console.log("\n🔍 Authorization Code Analysis");
	console.log("─".repeat(35));

	const code = await getUserInput("Paste your authorization code for analysis: ");

	console.log("\n📊 Code Analysis:");
	console.log(`Length: ${code.length} characters`);
	console.log(`Format: ${/^[A-Za-z0-9+/=]+$/.test(code) ? "Valid Base64-like" : "Invalid format"}`);
	console.log(`Starts with: ${code.substring(0, 10)}...`);
	console.log(`Ends with: ...${code.substring(code.length - 10)}`);

	// Check for common issues
	if (code.includes(" ")) {
		console.log("⚠️  WARNING: Code contains spaces - make sure you copied it correctly");
	}

	if (code.length < 20) {
		console.log("⚠️  WARNING: Code seems too short - might be incomplete");
	}

	if (code.length > 200) {
		console.log("⚠️  WARNING: Code seems too long - might include extra characters");
	}
}

// Run the debugger
if (require.main === module) {
	console.log("Choose an option:");
	console.log("1. Debug token exchange (full process)");
	console.log("2. Analyze authorization code only");

	getUserInput("\nEnter choice (1 or 2): ").then((choice) => {
		if (choice === "2") {
			analyzeAuthCode().catch(console.error);
		} else {
			debugTokenExchange().catch(console.error);
		}
	});
}

export { debugTokenExchange, analyzeAuthCode };
