import { generateKeyPairSync, sign } from "crypto";
import { verifyWebhookSignature } from "../src";

describe("verifyWebhookSignature", () => {
	it("accepts a valid signature and rejects a modified body", () => {
		const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
		const body = JSON.stringify({ message_id: "message" });
		const messageId = "event-id";
		const timestamp = "2026-08-11T12:00:00Z";
		const signature = sign("RSA-SHA256", Buffer.from(`${messageId}.${timestamp}.${body}`), privateKey).toString(
			"base64",
		);
		const params = { messageId, timestamp, body, signature, publicKey: publicKey.export({ type: "spki", format: "pem" }).toString() };

		expect(verifyWebhookSignature(params)).toBe(true);
		expect(verifyWebhookSignature({ ...params, body: `${body} ` })).toBe(false);
	});
});
