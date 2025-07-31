import type { Category, RequestFn } from "../types";
import { KickBadRequestError } from "../errors";

export class CategoriesModule {
	private readonly baseRoute = "/public/v1/categories";

	constructor(private request: RequestFn) {}

	async getCategories(params: { q: string; page?: number }): Promise<Category[]> {
		if (!params || !params.q) {
			throw new KickBadRequestError("q is required");
		}

		const searchParams = new URLSearchParams();

		searchParams.append("q", params.q);

		if (params?.page) {
			searchParams.append("page", params.page.toString());
		}

		return this.request<Category[]>(`${this.baseRoute}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
	}

	async getCategory(categoryId: number): Promise<Category> {
		return this.request<Category>(`${this.baseRoute}/${categoryId}`);
	}
}
