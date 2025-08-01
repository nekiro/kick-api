import type { Livestream } from "../types";
import { KickClient } from "../client";
import { KickBadRequestError } from "../errors";

export class LivestreamsModule {
	private readonly baseRoute = "/public/v1/livestreams";

	constructor(private client: KickClient) {}

	/**
	 * Get livestreams based on various filtering criteria
	 *
	 * Retrieve currently live streams with optional filtering by broadcaster,
	 * category, language, and sorting options.
	 *
	 * @param params - Livestream filtering parameters
	 * @param params.broadcaster_user_id - Array of broadcaster user IDs to filter by
	 * @param params.category_id - Category ID to filter streams by
	 * @param params.language - Language of the livestream (e.g., "en", "es", "fr")
	 * @param params.limit - Limit the number of results (min: 1, max: 100)
	 * @param params.sort - Sort by "viewer_count" or "started_at"
	 *
	 * @returns Promise that resolves to array of livestream information
	 *
	 * @example Get all live streams
	 * ```typescript
	 * const streams = await client.livestreams.getLivestreams();
	 * ```
	 *
	 * @example Get gaming streams sorted by viewer count
	 * ```typescript
	 * const streams = await client.livestreams.getLivestreams({
	 *   category_id: 1, // Gaming category
	 *   sort: "viewer_count",
	 *   limit: 20
	 * });
	 * ```
	 *
	 * @example Get streams from specific broadcasters
	 * ```typescript
	 * const streams = await client.livestreams.getLivestreams({
	 *   broadcaster_user_id: [12345, 67890]
	 * });
	 * ```
	 *
	 * @example Get English gaming streams
	 * ```typescript
	 * const streams = await client.livestreams.getLivestreams({
	 *   category_id: 1,
	 *   language: "en",
	 *   sort: "viewer_count",
	 *   limit: 50
	 * });
	 * ```
	 *
	 * @example Get recently started streams
	 * ```typescript
	 * const streams = await client.livestreams.getLivestreams({
	 *   sort: "started_at",
	 *   limit: 10
	 * });
	 * ```
	 *
	 * @throws {KickBadRequestError} When limit is outside the valid range (1-100)
	 * @throws {KickUnauthorizedError} When not properly authenticated
	 *
	 * @see https://docs.kick.com/apis/livestreams#get-livestreams
	 */
	async getLivestreams(params?: {
		broadcaster_user_id?: number[];
		category_id?: number;
		language?: string;
		limit?: number;
		sort?: "viewer_count" | "started_at";
	}): Promise<Livestream[]> {
		const searchParams = new URLSearchParams();

		// Validate limit parameter
		if (params?.limit && (params.limit < 1 || params.limit > 100)) {
			throw new KickBadRequestError("limit must be between 1 and 100");
		}

		// Add broadcaster_user_id parameters
		if (params?.broadcaster_user_id) {
			params.broadcaster_user_id.forEach((id) => {
				searchParams.append("broadcaster_user_id", id.toString());
			});
		}

		// Add category_id parameter
		if (params?.category_id) {
			searchParams.append("category_id", params.category_id.toString());
		}

		// Add language parameter
		if (params?.language) {
			searchParams.append("language", params.language);
		}

		// Add limit parameter
		if (params?.limit) {
			searchParams.append("limit", params.limit.toString());
		}

		// Add sort parameter
		if (params?.sort) {
			searchParams.append("sort", params.sort);
		}

		return this.client.request<Livestream[]>(
			`${this.baseRoute}${searchParams.size ? `?${searchParams.toString()}` : ""}`,
		);
	}
}
