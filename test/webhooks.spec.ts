import { generateKeyPairSync, sign } from "crypto";
import { isWebhookTimestampFresh, verifyWebhookSignature } from "../src";

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

	it("checks webhook timestamps against a replay window", () => {
		const now = Date.parse("2026-08-11T12:00:00Z");
		expect(isWebhookTimestampFresh("2026-08-11T11:56:00Z", 300, now)).toBe(true);
		expect(isWebhookTimestampFresh("2026-08-11T11:54:00Z", 300, now)).toBe(false);
		expect(isWebhookTimestampFresh("invalid", 300, now)).toBe(false);
	});
});
