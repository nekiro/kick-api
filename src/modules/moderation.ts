import { KickClient } from "../client";
import { KickBadRequestError } from "../errors";
import type { ModerationBanRequest, ModerationUnbanRequest } from "../types";

export class ModerationModule {
	private readonly baseRoute = "/public/v1/moderation/bans";

	constructor(private client: KickClient) {}

	async banUser(params: ModerationBanRequest): Promise<void> {
		this.validateUsers(params);
		if (params.duration !== undefined && (params.duration < 1 || params.duration > 10080)) {
			throw new KickBadRequestError("duration must be between 1 and 10080 minutes");
		}
		if (params.reason && params.reason.length > 100) {
			throw new KickBadRequestError("reason must be 100 characters or less");
		}
		await this.client.request<void>(this.baseRoute, { method: "POST", body: JSON.stringify(params) });
	}

	async unbanUser(params: ModerationUnbanRequest): Promise<void> {
		this.validateUsers(params);
		await this.client.request<void>(this.baseRoute, { method: "DELETE", body: JSON.stringify(params) });
	}

	private validateUsers(params: ModerationUnbanRequest): void {
		if (
			!params ||
			!Number.isInteger(params.broadcaster_user_id) ||
			params.broadcaster_user_id < 1 ||
			!Number.isInteger(params.user_id) ||
			params.user_id < 1
		) {
			throw new KickBadRequestError("broadcaster_user_id and user_id must be positive integers");
		}
	}
}
