import { client, KickNotFoundError } from "../src";

const makeClient = () => {
	const kickClient = new client({ clientId: "test-client-id", clientSecret: "test-client-secret" });
	kickClient.setToken({
		kind: "app",
		accessToken: "test-token",
		tokenType: "Bearer",
		expiresIn: 3600,
		expiresAt: Date.now() + 3600_000,
	});
	return kickClient;
};

describe("KickClient", () => {
	afterEach(() => jest.restoreAllMocks());

	it("exposes all API modules", () => {
		const kickClient = makeClient();
		expect(kickClient.categories).toBeDefined();
		expect(kickClient.channels).toBeDefined();
		expect(kickClient.livestreams).toBeDefined();
		expect(kickClient.chat).toBeDefined();
		expect(kickClient.users).toBeDefined();
		expect(kickClient.moderation).toBeDefined();
		expect(kickClient.events).toBeDefined();
		expect(kickClient.channelRewards).toBeDefined();
		expect(kickClient.kicks).toBeDefined();
		expect(kickClient.publicKey).toBeDefined();
	});

	it("throws KickNotFoundError when a channel slug does not exist", async () => {
		jest.spyOn(global, "fetch").mockResolvedValue(
			new Response(JSON.stringify({ data: [], message: "OK" }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		await expect(makeClient().channels.getChannel("missing-channel")).rejects.toBeInstanceOf(KickNotFoundError);
	});

	it("accepts a successful 204 response", async () => {
		jest.spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 204 }));

		await expect(makeClient().channels.updateChannel({ stream_title: "Updated" })).resolves.toBeUndefined();
	});

	it("keeps pagination metadata for v2 endpoints", async () => {
		jest.spyOn(global, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({ data: [], message: "OK", pagination: { next_cursor: "next" } }),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			),
		);

		await expect(makeClient().categories.getCategoriesV2({ limit: 25 })).resolves.toEqual({
			data: [],
			message: "OK",
			pagination: { next_cursor: "next" },
		});
	});
});
