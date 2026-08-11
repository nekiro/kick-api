import { KickClient } from "../client";
import { KickBadRequestError } from "../errors";
import type { User } from "../types";

export class UsersModule {
	private readonly baseRoute = "/public/v1/users";

	constructor(private client: KickClient) {}

	/** Get the authenticated user or users selected by ID. */
	async getUsers(ids?: number[]): Promise<User[]> {
		if (ids?.some((id) => !Number.isInteger(id) || id < 1)) {
			throw new KickBadRequestError("user IDs must be positive integers");
		}
		const searchParams = new URLSearchParams();
		ids?.forEach((id) => searchParams.append("id", id.toString()));
		const query = searchParams.size ? `?${searchParams.toString()}` : "";
		return this.client.request<User[]>(`${this.baseRoute}${query}`);
	}

	async getUser(id: number): Promise<User | null> {
		const users = await this.getUsers([id]);
		return users[0] ?? null;
	}
}
