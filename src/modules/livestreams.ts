import type {
	Livestream,
	LivestreamStats,
	LivestreamsV2Params,
	LivestreamV2,
	PaginatedResponse,
} from "../types";
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
	 * @deprecated Kick deprecated Livestreams v1. Use getLivestreamsV2 or getLivestreamsByUserIds.
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
		if (params?.broadcaster_user_id && params.broadcaster_user_id.length > 50) {
			throw new KickBadRequestError("broadcaster_user_id cannot contain more than 50 IDs");
		}
		if (params?.broadcaster_user_id?.some((id) => !Number.isInteger(id) || id < 1)) {
			throw new KickBadRequestError("broadcaster_user_id must contain positive integers");
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

	/** Get active livestreams using the current cursor-paginated v2 endpoint. */
	async getLivestreamsV2(params: LivestreamsV2Params = {}): Promise<PaginatedResponse<LivestreamV2>> {
		if (params.limit !== undefined && (params.limit < 1 || params.limit > 1000)) {
			throw new KickBadRequestError("limit must be between 1 and 1000");
		}
		if (params.category_id && params.category_id.length > 25) {
			throw new KickBadRequestError("category_id cannot contain more than 25 IDs");
		}
		if (params.category_id?.some((id) => !Number.isInteger(id) || id < 1)) {
			throw new KickBadRequestError("category_id must contain positive integers");
		}
		if (params.language_code && params.language_code.length > 25) {
			throw new KickBadRequestError("language_code cannot contain more than 25 values");
		}

		const searchParams = new URLSearchParams();
		params.category_id?.forEach((id) => searchParams.append("category_id", id.toString()));
		params.language_code?.forEach((code) => searchParams.append("language_code", code));
		if (params.limit !== undefined) searchParams.set("limit", params.limit.toString());
		if (params.cursor) searchParams.set("cursor", params.cursor);

		const query = searchParams.size ? `?${searchParams.toString()}` : "";
		return this.client.requestEnvelope<PaginatedResponse<LivestreamV2>>(`/public/v2/livestreams${query}`);
	}

	/** Get active livestreams for up to 100 broadcaster user IDs. */
	async getLivestreamsByUserIds(userIds: number[]): Promise<LivestreamV2[]> {
		if (!userIds.length || userIds.length > 100) {
			throw new KickBadRequestError("userIds must contain between 1 and 100 IDs");
		}
		if (userIds.some((id) => !Number.isInteger(id) || id < 1)) {
			throw new KickBadRequestError("userIds must contain positive integers");
		}
		const searchParams = new URLSearchParams();
		userIds.forEach((id) => searchParams.append("user_id", id.toString()));
		return this.client.request<LivestreamV2[]>(`/public/v1/users/livestreams?${searchParams.toString()}`);
	}

	async getLivestreamStats(): Promise<LivestreamStats> {
		return this.client.request<LivestreamStats>(`${this.baseRoute}/stats`);
	}
}
