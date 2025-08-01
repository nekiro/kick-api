/**
 * OAuth Troubleshooting Guide
 *
 * This script helps diagnose and fix common OAuth configuration issues,
 * especially the "invalid redirect uri" error.
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

async function troubleshootOAuth() {
	console.clear();
	console.log("🔧 OAuth Troubleshooting Guide");
	console.log("==============================\n");

	// Check for common redirect URI error
	console.log("❌ You received an 'invalid redirect uri' error");
	console.log("This means your redirect URI configuration doesn't match.\n");

	console.log("🔍 Let's diagnose the issue:\n");

	// Show current configuration
	console.log("📋 Current Configuration:");
	console.log("─".repeat(40));
	console.log(`Client ID:     ${CLIENT_ID}`);
	console.log(`Client Secret: ${CLIENT_SECRET.substring(0, 8)}...`);
	console.log(`Redirect URI:  ${REDIRECT_URI}`);
	console.log("─".repeat(40) + "\n");

	// Common causes
	console.log("🚨 Common Causes of 'invalid redirect uri' Error:");
	console.log("1. Redirect URI not registered in your Kick app");
	console.log("2. Exact URI mismatch (including protocol, port, path)");
	console.log("3. Trailing slash differences");
	console.log("4. HTTP vs HTTPS mismatch");
	console.log("5. Localhost vs 127.0.0.1 differences\n");

	// Debugging steps
	console.log("🔧 Debugging Steps:");
	console.log("━".repeat(50));

	console.log("\n1️⃣ Verify Your Kick App Configuration");
	console.log("   • Go to https://kick.com/developer-dashboard");
	console.log("   • Find your application");
	console.log("   • Check the 'Redirect URIs' section");
	console.log("   • Ensure your URI is EXACTLY: " + REDIRECT_URI);

	console.log("\n2️⃣ Common Redirect URI Formats");
	console.log("   ✅ Correct: http://localhost:3000/callback");
	console.log("   ❌ Wrong:   http://localhost:3000/callback/");
	console.log("   ❌ Wrong:   https://localhost:3000/callback");
	console.log("   ❌ Wrong:   http://127.0.0.1:3000/callback");

	console.log("\n3️⃣ Check Environment Variables");
	console.log("   Your .env file should contain:");
	console.log("   KICK_CLIENT_ID=your_actual_client_id");
	console.log("   KICK_CLIENT_SECRET=your_actual_client_secret");
	console.log("   KICK_REDIRECT_URI=http://localhost:3000/callback");

	// Interactive fixing
	console.log("\n4️⃣ Let's Fix This Together");
	console.log("━".repeat(30));

	const hasCheckedApp = await getUserInput("\nHave you verified your Kick app redirect URI configuration? (y/n): ");

	if (hasCheckedApp.toLowerCase() !== "y" && hasCheckedApp.toLowerCase() !== "yes") {
		console.log("\n⚠️  Please complete these steps first:");
		console.log("1. Visit https://kick.com/developer-dashboard");
		console.log("2. Find your application");
		console.log("3. Add this exact redirect URI: " + REDIRECT_URI);
		console.log("4. Save the configuration");
		console.log("5. Run this script again\n");
		return;
	}

	const needsDifferentURI = await getUserInput("Do you need to use a different redirect URI? (y/n): ");

	if (needsDifferentURI.toLowerCase() === "y" || needsDifferentURI.toLowerCase() === "yes") {
		const newRedirectUri = await getUserInput("Enter your correct redirect URI: ");
		console.log(`\n📝 Update your .env file with: KICK_REDIRECT_URI=${newRedirectUri}`);
		console.log("Then restart this application.\n");
		return;
	}

	// Test with corrected configuration
	console.log("\n5️⃣ Testing OAuth URL Generation");
	console.log("━".repeat(35));

	try {
		const userClient = new client({
			clientId: CLIENT_ID,
			clientSecret: CLIENT_SECRET,
			redirectUri: REDIRECT_URI,
			debug: true,
		});

		const pkceParams = userClient.generatePKCEParams();
		const authUrl = userClient.getAuthorizationUrl(pkceParams, ["public", "chat:read"]);

		console.log("✅ OAuth URL generated successfully!");
		console.log("🔗 Test URL: " + authUrl.substring(0, 60) + "...\n");

		const shouldTest = await getUserInput("Would you like to test this URL now? (y/n): ");

		if (shouldTest.toLowerCase() === "y" || shouldTest.toLowerCase() === "yes") {
			console.log("\n🌐 Testing OAuth Flow");
			console.log("─".repeat(25));
			console.log("1. Click or copy this URL:");
			console.log(`   ${authUrl}\n`);
			console.log("2. Complete the authorization");
			console.log("3. Check if you get redirected without errors");
			console.log("4. Look for the authorization code in the URL\n");

			await getUserInput("Press ENTER after testing the URL...");

			const gotError = await getUserInput("Did you get another 'invalid redirect uri' error? (y/n): ");

			if (gotError.toLowerCase() === "y" || gotError.toLowerCase() === "yes") {
				console.log("\n❌ Still getting errors. Additional troubleshooting:");
				console.log("━".repeat(50));
				console.log("1. Double-check the redirect URI is EXACTLY the same");
				console.log("2. Try using 127.0.0.1 instead of localhost");
				console.log("3. Check for trailing slashes");
				console.log("4. Verify your app is approved/active");
				console.log("5. Contact Kick support if the issue persists");
			} else {
				console.log("\n✅ Great! The redirect URI is now working correctly.");
				console.log("You can proceed with the user authentication examples.");
			}
		}
	} catch (error) {
		console.error("\n❌ Error generating OAuth URL:");
		console.error(error);
	}

	// Additional help
	console.log("\n📚 Additional Resources:");
	console.log("━".repeat(25));
	console.log("• Kick Developer Docs: https://docs.kick.com/");
	console.log("• OAuth 2.1 Specification: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-07");
	console.log("• Common redirect URI patterns:");
	console.log("  - Development: http://localhost:3000/callback");
	console.log("  - Production: https://yourdomain.com/auth/callback");
	console.log("  - Mobile: custom://oauth/callback");
}

// Common redirect URI variations to test
async function suggestRedirectURIs() {
	console.log("\n🔄 Common Redirect URI Variations to Try:");
	console.log("━".repeat(45));

	const variations = [
		"http://localhost:3000/callback",
		"http://localhost:3000/auth/callback",
		"http://127.0.0.1:3000/callback",
		"http://localhost:8080/callback",
		"https://localhost:3000/callback",
	];

	variations.forEach((uri, index) => {
		console.log(`${index + 1}. ${uri}`);
	});

	console.log("\nTry adding these to your Kick app configuration and test each one.");
}

// Run troubleshooting
if (require.main === module) {
	troubleshootOAuth()
		.then(() => suggestRedirectURIs())
		.catch(console.error);
}

export { troubleshootOAuth, suggestRedirectURIs };
