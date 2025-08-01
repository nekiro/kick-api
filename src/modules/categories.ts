import type { Category } from "../types";
import { KickBadRequestError } from "../errors";
import { KickClient } from "../client";

export class CategoriesModule {
	private readonly baseRoute = "/public/v1/categories";

	constructor(private client: KickClient) {}

	async getCategories(params: { q: string; page?: number }): Promise<Category[]> {
		if (!params || !params.q) {
			throw new KickBadRequestError("q is required");
		}

		const searchParams = new URLSearchParams();

		searchParams.append("q", params.q);

		if (params?.page) {
			searchParams.append("page", params.page.toString());
		}

		return this.client.request<Category[]>(
			`${this.baseRoute}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
		);
	}

	async getCategory(categoryId: number): Promise<Category> {
		return this.client.request<Category>(`${this.baseRoute}/${categoryId}`);
	}
}
