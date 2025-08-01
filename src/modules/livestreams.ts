import type { Livestream } from "../types";
import { KickClient } from "../client";

export class LivestreamsModule {
	private readonly baseRoute = "/public/v1/livestreams";

	constructor(private client: KickClient) {}

	async getLivestreams(params?: {
		category?: string;
		subcategory?: string;
		sort?: "viewer_count" | "created_at";
		page?: number;
	}): Promise<Livestream[]> {
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

		return this.client.request<Livestream[]>(
			`${this.baseRoute}${searchParams.size ? `?${searchParams.toString()}` : ""}`,
		);
	}
}
