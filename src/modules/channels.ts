import type { Channel } from "../types";
import { KickClient } from "../client";
import { KickBadRequestError } from "../errors";

export class ChannelsModule {
	private readonly baseRoute = "/public/v1/channels";

	constructor(private client: KickClient) {}

	/**
	 * Retrieve channel information
	 *
	 * You can either:
	 * 1. Provide no parameters (returns information for the currently authenticated user)
	 * 2. Provide only broadcaster_user_id parameters (up to 50)
	 * 3. Provide only slug parameters (up to 50, each max 25 characters)
	 *
	 * Note: You cannot mix broadcaster_user_id and slug parameters in the same request.
	 *
	 * @param params - Channel retrieval parameters
	 * @param params.broadcaster_user_id - Array of broadcaster user IDs (cannot be used with slug)
	 * @param params.slug - Array of channel slugs (cannot be used with broadcaster_user_id)
	 *
	 * @returns Promise that resolves to array of channel information
	 *
	 * @example Get current user's channel
	 * ```typescript
	 * const channels = await client.channels.getChannels();
	 * ```
	 *
	 * @example Get channels by user IDs
	 * ```typescript
	 * const channels = await client.channels.getChannels({
	 *   broadcaster_user_id: [12345, 67890]
	 * });
	 * ```
	 *
	 * @example Get channels by slugs
	 * ```typescript
	 * const channels = await client.channels.getChannels({
	 *   slug: ["xqc", "pokimane"]
	 * });
	 * ```
	 *
	 * @throws {KickBadRequestError} When mixing broadcaster_user_id and slug parameters
	 * @throws {KickBadRequestError} When providing more than 50 IDs or slugs
	 * @throws {KickUnauthorizedError} When not authenticated and no parameters provided
	 *
	 * @see https://docs.kick.com/apis/channels#get-channels
	 */
	async getChannels(params?: { broadcaster_user_id?: number[]; slug?: string[] }): Promise<Channel[]> {
		const searchParams = new URLSearchParams();

		// Validate that both parameters are not used together
		if (params?.broadcaster_user_id && params?.slug) {
			throw new KickBadRequestError("Cannot mix broadcaster_user_id and slug parameters in the same request");
		}

		// Validate array limits
		if (params?.broadcaster_user_id && params.broadcaster_user_id.length > 50) {
			throw new KickBadRequestError("Cannot provide more than 50 broadcaster user IDs");
		}

		if (params?.slug && params.slug.length > 50) {
			throw new KickBadRequestError("Cannot provide more than 50 slugs");
		}

		// Validate slug length
		if (params?.slug && params.slug.some((slug) => slug.length > 25)) {
			throw new KickBadRequestError("Each slug must be 25 characters or less");
		}

		// Add broadcaster_user_id parameters
		if (params?.broadcaster_user_id) {
			params.broadcaster_user_id.forEach((id) => {
				searchParams.append("broadcaster_user_id", id.toString());
			});
		}

		// Add slug parameters
		if (params?.slug) {
			params.slug.forEach((slug) => {
				searchParams.append("slug", slug);
			});
		}

		return this.client.request<Channel[]>(`${this.baseRoute}${searchParams.size ? `?${searchParams.toString()}` : ""}`);
	}

	/**
	 * Update livestream metadata for a channel
	 *
	 * Updates the authenticated user's channel with new metadata.
	 *
	 * @param params - Channel update parameters
	 * @param params.category_id - New category ID for the channel
	 * @param params.custom_tags - Array of custom tags for the stream
	 * @param params.stream_title - New stream title
	 *
	 * @returns Promise that resolves when the update is complete
	 *
	 * @example Update stream title
	 * ```typescript
	 * await client.channels.updateChannel({
	 *   stream_title: "New stream title!"
	 * });
	 * ```
	 *
	 * @example Update category and tags
	 * ```typescript
	 * await client.channels.updateChannel({
	 *   category_id: 1,
	 *   custom_tags: ["gameplay", "tutorial"],
	 *   stream_title: "Learning new strategies"
	 * });
	 * ```
	 *
	 * @throws {KickUnauthorizedError} When not authenticated
	 * @throws {KickForbiddenError} When user doesn't have permission to update the channel
	 * @throws {KickBadRequestError} When provided parameters are invalid
	 *
	 * @see https://docs.kick.com/apis/channels#patch-channels
	 */
	async updateChannel(params: { category_id?: number; custom_tags?: string[]; stream_title?: string }): Promise<void> {
		await this.client.request<void>(this.baseRoute, {
			method: "PATCH",
			body: JSON.stringify(params),
		});
	}

	/**
	 * Get a single channel by slug
	 *
	 * Convenience method to get information for a specific channel.
	 *
	 * @param slug - The channel slug (username)
	 *
	 * @returns Promise that resolves to the channel information
	 *
	 * @example Get specific channel
	 * ```typescript
	 * const channel = await client.channels.getChannel("xqc");
	 * console.log(channel.stream_title);
	 * ```
	 *
	 * @throws {KickNotFoundError} When channel with the given slug doesn't exist
	 * @throws {KickBadRequestError} When slug is invalid or too long
	 *
	 * @see https://docs.kick.com/apis/channels#get-channels
	 */
	async getChannel(slug: string): Promise<Channel> {
		if (!slug || slug.length > 25) {
			throw new KickBadRequestError("Channel slug is required and must be 25 characters or less");
		}

		const channels = await this.getChannels({ slug: [slug] });

		if (channels.length === 0) {
			throw new KickBadRequestError(`Channel '${slug}' not found`);
		}

		return channels[0];
	}
}
