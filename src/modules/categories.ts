import type { CategoriesV2Params, Category, CategoryDetail, CategoryV2, PaginatedResponse } from "../types";
import { KickBadRequestError } from "../errors";
import { KickClient } from "../client";

export class CategoriesModule {
	private readonly baseRoute = "/public/v1/categories";

	constructor(private client: KickClient) {}

	/**
	 * Get categories based on search query
	 *
	 * Returns up to 100 results at a time; use the `page` parameter to get more results.
	 *
	 * @param params - Search parameters
	 * @param params.q - Search query (required)
	 * @param params.page - Page number (defaults to 1 if not provided)
	 *
	 * @returns Promise that resolves to array of categories
	 *
	 * @example Basic search
	 * ```typescript
	 * const categories = await client.categories.getCategories({
	 *   q: "gaming"
	 * });
	 * ```
	 *
	 * @example Search with pagination
	 * ```typescript
	 * const categories = await client.categories.getCategories({
	 *   q: "music",
	 *   page: 2
	 * });
	 * ```
	 *
	 * @throws {KickBadRequestError} When search query (q) is missing
	 *
	 * @see https://docs.kick.com/apis/categories#get-categories
	 * @deprecated Kick deprecated Categories v1. Use getCategoriesV2.
	 */
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

	/** Get categories using the current cursor-paginated v2 endpoint. */
	async getCategoriesV2(params: CategoriesV2Params = {}): Promise<PaginatedResponse<CategoryV2>> {
		if (params.limit !== undefined && (params.limit < 1 || params.limit > 1000)) {
			throw new KickBadRequestError("limit must be between 1 and 1000");
		}

		const searchParams = new URLSearchParams();
		if (params.cursor) searchParams.set("cursor", params.cursor);
		if (params.limit !== undefined) searchParams.set("limit", params.limit.toString());
		if (params.name?.length) searchParams.set("name", params.name.join(","));
		if (params.tag?.length) searchParams.set("tag", params.tag.join(","));
		if (params.id?.length) searchParams.set("id", params.id.join(","));

		const query = searchParams.size ? `?${searchParams.toString()}` : "";
		return this.client.requestEnvelope<PaginatedResponse<CategoryV2>>(`/public/v2/categories${query}`);
	}

	/**
	 * Get a specific category by ID
	 *
	 * @param categoryId - The ID of the category to retrieve
	 *
	 * @returns Promise that resolves to the category details
	 *
	 * @example Get category by ID
	 * ```typescript
	 * const category = await client.categories.getCategory(1);
	 * console.log(category.name); // e.g., "Gaming"
	 * ```
	 *
	 * @throws {KickNotFoundError} When category with the given ID doesn't exist
	 * @throws {KickBadRequestError} When category ID is invalid
	 *
	 * @see https://docs.kick.com/apis/categories#get-category
	 * @deprecated Kick deprecated Categories v1. Use getCategoriesV2 with an id filter.
	 */
	async getCategory(categoryId: number): Promise<CategoryDetail> {
		return this.client.request<CategoryDetail>(`${this.baseRoute}/${categoryId}`);
	}
}
