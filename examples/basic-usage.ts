/**
 * Basic Usage Example for Kick API Client
 *
 * This example demonstrates how to use the Kick API client in a real application.
 * Replace the CLIENT_ID and CLIENT_SECRET with your actual credentials.
 *
 * To run this example:
 * 1. npm install
 * 2. npm run build
 * 3. node -r ts-node/register examples/basic-usage.ts
 */

import { client } from "../src";
import dotenv from "dotenv";
dotenv.config();

// Configuration - replace with your actual credentials
const CLIENT_ID = process.env.KICK_CLIENT_ID || "your-client-id";
const CLIENT_SECRET = process.env.KICK_CLIENT_SECRET || "your-client-secret";

async function main() {
	console.log("🚀 Initializing Kick API Client...");

	// Create client instance
	const kickClient = new client({
		clientId: CLIENT_ID,
		clientSecret: CLIENT_SECRET,
		debug: true, // Enable debug logging
	});

	try {
		console.log("\n📂 Testing Categories API...");

		// Search for gaming categories
		const categories = await kickClient.categories.getCategories({
			q: "gaming",
			page: 1,
		});

		console.log(`Found ${categories.length} categories:`);
		categories.forEach((category, index) => {
			console.log(`  ${index + 1}. ${category.name} (ID: ${category.id})`);
		});

		// Get specific category
		if (categories.length > 0) {
			const firstCategory = await kickClient.categories.getCategory(categories[0].id);
			console.log(`\nDetailed info for "${firstCategory.name}":`);
			console.log(`  - ID: ${firstCategory.id}`);
			console.log(`  - Thumbnail: ${firstCategory.thumbnail}`);
		}

		console.log("\n📺 Testing Channels API...");

		// Get channels
		const channels = await kickClient.channels.getChannels({
			category: "Gaming",
			sort: "viewer_count",
			page: 1,
		});

		console.log(`Found ${channels.length} channels:`);
		channels.slice(0, 3).forEach((channel, index) => {
			console.log(`  ${index + 1}. ${channel.user.username} (${channel.followers_count} followers)`);
		});

		console.log("\n🎥 Testing Livestreams API...");

		// Get live streams
		const livestreams = await kickClient.livestreams.getLivestreams({
			category: "Gaming",
			sort: "viewer_count",
			page: 1,
		});

		console.log(`Found ${livestreams.length} live streams:`);
		livestreams.slice(0, 3).forEach((stream, index) => {
			console.log(`  ${index + 1}. "${stream.stream_title}" - ${stream.viewer_count} viewers`);
		});

		console.log("\n💬 Testing Chat API...");

		// Send a bot message
		const botMessage = await kickClient.chat.postMessage({
			type: "bot",
			content: "Hello from the Kick API client! 🤖 This is a test message.",
		});

		console.log("Bot message sent successfully:");
		console.log(`  - Message ID: ${botMessage.message_id}`);
		console.log(`  - Was sent: ${botMessage.is_sent}`);

		// Example of sending a user message (requires broadcaster_user_id)
		// Uncomment and provide a valid broadcaster_user_id to test:

		const userMessage = await kickClient.chat.postMessage({
			type: "user",
			broadcaster_user_id: 31388225, // Replace with actual broadcaster ID
			content: "Thanks for the great stream! 👍",
		});

		console.log("User message sent successfully:");
		console.log(`  - Message ID: ${userMessage.message_id}`);

		// Example of sending a reply message
		const replyMessage = await kickClient.chat.postMessage({
			type: "bot",
			content: "This is a reply to the previous message! 📝",
			reply_to_message_id: botMessage.message_id,
		});

		console.log("Reply message sent successfully:");
		console.log(`  - Message ID: ${replyMessage.message_id}`);
		console.log(`  - Replying to: ${botMessage.message_id}`);
	} catch (error) {
		console.error("\n❌ Error occurred:");

		if (error instanceof Error) {
			console.error(`  - Type: ${error.constructor.name}`);
			console.error(`  - Message: ${error.message}`);

			// Show additional error details if available
			if ("status" in error) {
				console.error(`  - Status: ${(error as any).status}`);
			}
			if ("responseBody" in error) {
				console.error(`  - Response: ${JSON.stringify((error as any).responseBody, null, 2)}`);
			}
		} else {
			console.error(error);
		}
	}

	console.log("\n✅ Example completed!");
}

// Run the example
if (require.main === module) {
	main().catch(console.error);
}

export { main };
