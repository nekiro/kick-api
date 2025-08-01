import type { Channel } from "../types";
import { KickClient } from "../client";

export class ChannelsModule {
	private readonly baseRoute = "/public/v1/channels";

	constructor(private client: KickClient) {}

	async getChannels(params?: {
		category?: string;
		subcategory?: string;
		sort?: "viewer_count" | "created_at";
		page?: number;
	}): Promise<Channel[]> {
		const searchParams = new URLSearchParams();

		if (params?.category) {
			searchParams.append("category", params.category);
		}

		if (params?.subcategory) {
			searchParams.append("subcategory", params.subcategory);
		}

		if (params?.sort) {
			searchParams.append("sort", params.sort);
		}

		if (params?.page) {
			searchParams.append("page", params.page.toString());
		}

		return this.client.request<Channel[]>(`${this.baseRoute}${searchParams.size ? `?${searchParams.toString()}` : ""}`);
	}
}
