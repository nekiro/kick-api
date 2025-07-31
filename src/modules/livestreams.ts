import type { Livestream, RequestFn } from "../types";

export class LivestreamsModule {
	private readonly baseRoute = "/public/v1/livestreams";

	constructor(private request: RequestFn) {}

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

		return this.request<Livestream[]>(`${this.baseRoute}${searchParams.size ? `?${searchParams.toString()}` : ""}`);
	}
}
