import { KickClient } from "../client";
import { KickBadRequestError } from "../errors";
import type { KicksLeaderboard } from "../types";

export class KicksModule {
	constructor(private client: KickClient) {}

	async getLeaderboard(top?: number): Promise<KicksLeaderboard> {
		if (top !== undefined && (top < 1 || top > 100)) {
			throw new KickBadRequestError("top must be between 1 and 100");
		}
		const query = top !== undefined ? `?top=${top}` : "";
		return this.client.request<KicksLeaderboard>(`/public/v1/kicks/leaderboard${query}`);
	}
}
