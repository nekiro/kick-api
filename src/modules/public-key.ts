import { KickClient } from "../client";

export class PublicKeyModule {
	constructor(private client: KickClient) {}

	async getPublicKey(): Promise<string> {
		const result = await this.client.request<{ public_key: string }>("/public/v1/public-key");
		return result.public_key;
	}
}
