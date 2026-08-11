import { KickClient } from "../client";
import { KickBadRequestError } from "../errors";
import type {
	ChannelReward,
	ChannelRewardRedemptionStatus,
	CreateChannelRewardRequest,
	FailedRedemption,
	PaginatedResponse,
	RedemptionsByReward,
	UpdateChannelRewardRequest,
} from "../types";

export interface GetRedemptionsParams {
	reward_id?: string;
	status?: ChannelRewardRedemptionStatus;
	id?: string[];
	cursor?: string;
}

export class ChannelRewardsModule {
	private readonly baseRoute = "/public/v1/channels/rewards";

	constructor(private client: KickClient) {}

	async getRewards(): Promise<ChannelReward[]> {
		return this.client.request<ChannelReward[]>(this.baseRoute);
	}

	async createReward(params: CreateChannelRewardRequest): Promise<ChannelReward> {
		this.validateReward(params, true);
		return this.client.request<ChannelReward>(this.baseRoute, { method: "POST", body: JSON.stringify(params) });
	}

	async updateReward(id: string, params: UpdateChannelRewardRequest): Promise<ChannelReward> {
		this.validateId(id, "reward ID");
		if (!params || Object.keys(params).length === 0) {
			throw new KickBadRequestError("At least one reward property is required");
		}
		this.validateReward(params, false);
		return this.client.request<ChannelReward>(`${this.baseRoute}/${encodeURIComponent(id)}`, {
			method: "PATCH",
			body: JSON.stringify(params),
		});
	}

	async deleteReward(id: string): Promise<void> {
		this.validateId(id, "reward ID");
		await this.client.request<void>(`${this.baseRoute}/${encodeURIComponent(id)}`, { method: "DELETE" });
	}

	async getRedemptions(params: GetRedemptionsParams = {}): Promise<PaginatedResponse<RedemptionsByReward>> {
		if (params.id?.length && (params.reward_id || params.status || params.cursor)) {
			throw new KickBadRequestError("id cannot be combined with other redemption filters");
		}
		const searchParams = new URLSearchParams();
		if (params.reward_id) searchParams.set("reward_id", params.reward_id);
		if (params.status) searchParams.set("status", params.status);
		params.id?.forEach((id) => searchParams.append("id", id));
		if (params.cursor) searchParams.set("cursor", params.cursor);
		const query = searchParams.size ? `?${searchParams.toString()}` : "";
		return this.client.requestEnvelope<PaginatedResponse<RedemptionsByReward>>(
			`${this.baseRoute}/redemptions${query}`,
		);
	}

	async acceptRedemptions(ids: string[]): Promise<FailedRedemption[]> {
		this.validateRedemptionIds(ids);
		return this.client.request<FailedRedemption[]>(`${this.baseRoute}/redemptions/accept`, {
			method: "POST",
			body: JSON.stringify({ ids }),
		});
	}

	async rejectRedemptions(ids: string[]): Promise<FailedRedemption[]> {
		this.validateRedemptionIds(ids);
		return this.client.request<FailedRedemption[]>(`${this.baseRoute}/redemptions/reject`, {
			method: "POST",
			body: JSON.stringify({ ids }),
		});
	}

	private validateRedemptionIds(ids: string[]): void {
		if (!ids.length || ids.length > 25 || ids.some((id) => !id) || new Set(ids).size !== ids.length) {
			throw new KickBadRequestError("ids must contain between 1 and 25 unique redemption IDs");
		}
	}

	private validateId(id: string, name: string): void {
		if (!id) throw new KickBadRequestError(`${name} is required`);
	}

	private validateReward(params: UpdateChannelRewardRequest, creating: boolean): void {
		if (creating && (!params.title || params.cost === undefined)) {
			throw new KickBadRequestError("title and cost are required");
		}
		if (params.title !== undefined && (!params.title || params.title.length > 50)) {
			throw new KickBadRequestError("title must contain between 1 and 50 characters");
		}
		if (params.cost !== undefined && (!Number.isInteger(params.cost) || params.cost < 1)) {
			throw new KickBadRequestError("cost must be a positive integer");
		}
		if (params.description !== undefined && params.description.length > 200) {
			throw new KickBadRequestError("description must be 200 characters or less");
		}
		if (params.background_color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(params.background_color)) {
			throw new KickBadRequestError("background_color must be a six-digit hex color");
		}
	}
}
