import { client, KickBadRequestError } from "../src";

const makeClient = () => {
	const kickClient = new client({ clientId: "id", clientSecret: "secret" });
	kickClient.setToken({
		kind: "app",
		accessToken: "token",
		tokenType: "Bearer",
		expiresIn: 3600,
		expiresAt: Date.now() + 3600_000,
	});
	return kickClient;
};

const jsonResponse = (data: unknown) =>
	new Response(JSON.stringify({ data, message: "OK" }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});

describe("API modules", () => {
	afterEach(() => jest.restoreAllMocks());

	it("serializes v2 category and livestream filters", async () => {
		const fetchMock = jest.spyOn(global, "fetch").mockImplementation(async () =>
			new Response(JSON.stringify({ data: [], message: "OK", pagination: { next_cursor: "" } }), {
				status: 200,
			}),
		);
		const kickClient = makeClient();

		await kickClient.categories.getCategoriesV2({ name: ["Just Chatting"], id: [1, 2], limit: 25 });
		await kickClient.livestreams.getLivestreamsV2({
			category_id: [1, 2],
			language_code: ["en", "pl"],
			cursor: "next",
		});

		expect(fetchMock.mock.calls[0][0]).toBe(
			"https://api.kick.com/public/v2/categories?limit=25&name=Just+Chatting&id=1%2C2",
		);
		expect(fetchMock.mock.calls[1][0]).toBe(
			"https://api.kick.com/public/v2/livestreams?category_id=1&category_id=2&language_code=en&language_code=pl&cursor=next",
		);
	});

	it("calls every newly exposed public API group", async () => {
		const fetchMock = jest.spyOn(global, "fetch").mockImplementation(async (input) => {
			const url = String(input);
			if (url.endsWith("/public/v1/public-key")) return jsonResponse({ public_key: "pem" });
			if (url.includes("/redemptions?")) {
				return new Response(JSON.stringify({ data: [], message: "OK", pagination: { next_cursor: "" } }));
			}
			return jsonResponse([]);
		});
		const kickClient = makeClient();

		await kickClient.users.getUsers([1, 2]);
		await kickClient.livestreams.getLivestreamsByUserIds([1, 2]);
		await kickClient.livestreams.getLivestreamStats();
		await kickClient.moderation.banUser({ broadcaster_user_id: 1, user_id: 2, duration: 10 });
		await kickClient.moderation.unbanUser({ broadcaster_user_id: 1, user_id: 2 });
		await kickClient.events.getSubscriptions(1);
		await kickClient.events.subscribe({ events: [{ name: "channel.followed", version: 1 }] });
		await kickClient.events.unsubscribe(["sub-id"]);
		await kickClient.channelRewards.getRewards();
		await kickClient.channelRewards.createReward({ title: "Reward", cost: 100 });
		await kickClient.channelRewards.updateReward("reward-id", { cost: 200 });
		await kickClient.channelRewards.deleteReward("reward-id");
		await kickClient.channelRewards.getRedemptions({ reward_id: "reward-id", status: "pending" });
		await kickClient.channelRewards.acceptRedemptions(["redemption-id"]);
		await kickClient.channelRewards.rejectRedemptions(["redemption-id"]);
		await kickClient.kicks.getLeaderboard(10);
		await expect(kickClient.publicKey.getPublicKey()).resolves.toBe("pem");
		await kickClient.chat.deleteMessage("message-id");

		const urls = fetchMock.mock.calls.map(([input]) => String(input));
		expect(urls).toEqual(expect.arrayContaining([
			"https://api.kick.com/public/v1/users?id=1&id=2",
			"https://api.kick.com/public/v1/livestreams/stats",
			"https://api.kick.com/public/v1/kicks/leaderboard?top=10",
			"https://api.kick.com/public/v1/chat/message-id",
		]));
	});

	it("validates documented API limits before making a request", async () => {
		const fetchMock = jest.spyOn(global, "fetch");
		const kickClient = makeClient();

		await expect(kickClient.categories.getCategoriesV2({ cursor: "x".repeat(29) })).rejects.toBeInstanceOf(
			KickBadRequestError,
		);
		await expect(kickClient.categories.getCategoriesV2({ id: [0] })).rejects.toBeInstanceOf(KickBadRequestError);
		await expect(
			kickClient.livestreams.getLivestreams({ broadcaster_user_id: Array.from({ length: 51 }, (_, i) => i + 1) }),
		).rejects.toBeInstanceOf(KickBadRequestError);
		await expect(kickClient.channels.updateChannel({ category_id: 0 })).rejects.toBeInstanceOf(KickBadRequestError);
		await expect(kickClient.channelRewards.createReward({ title: "", cost: 0 })).rejects.toBeInstanceOf(
			KickBadRequestError,
		);
		await expect(kickClient.channelRewards.updateReward("reward", {})).rejects.toBeInstanceOf(KickBadRequestError);
		await expect(kickClient.moderation.banUser({ broadcaster_user_id: 0, user_id: 2 })).rejects.toBeInstanceOf(
			KickBadRequestError,
		);
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
