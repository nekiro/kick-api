import type { ChatMessageRequest, ChatMessageResponse } from "../types";
import { KickBadRequestError } from "../errors";
import { KickClient } from "../client";

export class ChatModule {
	private readonly baseRoute = "/public/v1/chat";

	constructor(private client: KickClient) {}

	/**
	 * Send a chat message as either a bot or user
	 *
	 * @param params - Message parameters with conditional requirements:
	 *   - For bot messages: only content and type are required
	 *   - For user messages: broadcaster_user_id is also required
	 *
	 * @example Bot message
	 * ```typescript
	 * await client.chat.postMessage({
	 *   type: "bot",
	 *   content: "Hello from bot!"
	 * });
	 * ```
	 *
	 * @example User message
	 * ```typescript
	 * await client.chat.postMessage({
	 *   type: "user",
	 *   broadcaster_user_id: 12345,
	 *   content: "Hello from user!"
	 * });
	 * ```
	 *
	 * @example Reply message
	 * ```typescript
	 * await client.chat.postMessage({
	 *   type: "bot",
	 *   content: "This is a reply!",
	 *   reply_to_message_id: "original_message_id"
	 * });
	 * ```
	 */
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
