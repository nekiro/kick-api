import type { User } from "../types.ts";
import { KickClient } from "../client.ts";

export class UsersModule {
	private readonly baseRoute = "/public/v1/users";

	constructor(private client: KickClient) {}

	/**
	 * Retrieve user information based on provided user IDs.
	 * If no user IDs are specified, the information for the
	 * currently authorised user will be returned by default.
	 *
	 * @param id - The ID of the user to retrieve
	 *
	 * @returns Promise that resolves to the user informations
	 *
	 * @example Get user by ID
	 * ```typescript
	 * const user = await client.users.getUser(123);
	 * console.log(user.username); // e.g., "john_doe"
	 * ```
	 *
	 * @example Get current user
	 * ```typescript
	 * const user = await client.users.getUser();
	 * console.log(user.username); // e.g., "john_doe"
	 * ```
	 *
	 * @throws {KickNotFoundError} When category with the given ID doesn't exist
	 * @throws {KickBadRequestError} When category ID is invalid
	 *
	 * @see https://docs.kick.com/apis/categories#get-category
	 */
	async getUser(id?: number): Promise<User> {
		return await this.client.request<User>(id ? `${this.baseRoute}?id=${id}` : this.baseRoute);
	}
}
