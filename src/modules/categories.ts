import type { ApiResponse, Category, PaginatedResponse, RequestFn } from "../types";

export class CategoriesModule {
	private readonly baseRoute = "/public/v1/categories";

	constructor(private request: RequestFn) {}

	async getCategories(params?: { q: string; page?: number }): Promise<PaginatedResponse<Category>> {
		const searchParams = new URLSearchParams();

		if (params?.q) {
			searchParams.append("q", params.q);
		}

		if (params?.page) {
			searchParams.append("page", params.page.toString());
		}

		const endpoint = `${this.baseRoute}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
		return this.request<PaginatedResponse<Category>>(endpoint);
	}

	async getCategory(categoryId: number): Promise<ApiResponse<Category>> {
		return this.request<ApiResponse<Category>>(`${this.baseRoute}/${categoryId}`);
	}
}
