import { KickClient } from "../client";
import { KickBadRequestError } from "../errors";
import type { EventSubscription, EventSubscriptionRequest, EventSubscriptionResult } from "../types";
import { verify } from "crypto";

export interface VerifyWebhookSignatureParams {
	messageId: string;
	timestamp: string;
	body: string | Buffer;
	signature: string;
	publicKey: string;
}

/** Verify Kick-Event-Signature against the exact raw request body. */
export function verifyWebhookSignature(params: VerifyWebhookSignatureParams): boolean {
	const rawBody = Buffer.isBuffer(params.body) ? params.body.toString("utf8") : params.body;
	const signedPayload = `${params.messageId}.${params.timestamp}.${rawBody}`;
	return verify("RSA-SHA256", Buffer.from(signedPayload), params.publicKey, Buffer.from(params.signature, "base64"));
}

/** Check the webhook timestamp against a replay-protection window. Persist messageId separately for idempotency. */
export function isWebhookTimestampFresh(timestamp: string, maxAgeSeconds = 300, now = Date.now()): boolean {
	if (maxAgeSeconds < 0) return false;
	const sentAt = Date.parse(timestamp);
	return Number.isFinite(sentAt) && Math.abs(now - sentAt) <= maxAgeSeconds * 1000;
}

export class EventsModule {
	private readonly baseRoute = "/public/v1/events/subscriptions";

	constructor(private client: KickClient) {}

	async getSubscriptions(broadcasterUserId?: number): Promise<EventSubscription[]> {
		const query = broadcasterUserId !== undefined ? `?broadcaster_user_id=${broadcasterUserId}` : "";
		return this.client.request<EventSubscription[]>(`${this.baseRoute}${query}`);
	}

	async subscribe(params: EventSubscriptionRequest): Promise<EventSubscriptionResult[]> {
		if (!params?.events.length) throw new KickBadRequestError("events cannot be empty");
		return this.client.request<EventSubscriptionResult[]>(this.baseRoute, {
			method: "POST",
			body: JSON.stringify(params),
		});
	}

	async unsubscribe(ids: string[]): Promise<void> {
		if (!ids.length || ids.some((id) => !id)) throw new KickBadRequestError("ids cannot be empty");
		const searchParams = new URLSearchParams();
		ids.forEach((id) => searchParams.append("id", id));
		await this.client.request<void>(`${this.baseRoute}?${searchParams.toString()}`, { method: "DELETE" });
	}
}
