import type { ChatMessageRequest, ChatMessageResponse } from "../types";
import { KickBadRequestError } from "../errors";
import { KickClient } from "../client";

export class ChatModule {
	private readonly baseRoute = "/public/v1/chat";

	constructor(private client: KickClient) {}

	async postMessage(params: ChatMessageRequest): Promise<ChatMessageResponse> {
		if (!params || !params.content) {
			throw new KickBadRequestError("content is required");
		}

		if (!params.type || !["user", "bot"].includes(params.type)) {
			throw new KickBadRequestError("type must be 'user' or 'bot'");
		}

		if (params.content.length > 500) {
			throw new KickBadRequestError("content must be 500 characters or less");
		}

		if (params.type === "user" && !params.broadcaster_user_id) {
			throw new KickBadRequestError("broadcaster_user_id is required when type is 'user'");
		}

		return this.client.request<ChatMessageResponse>(this.baseRoute, {
			method: "POST",
			body: JSON.stringify(params),
		});
	}
}
