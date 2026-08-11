import {
	client,
	KickNetworkError,
	KickNotFoundError,
	type UserOAuthToken,
} from "../src";

const jsonResponse = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		statusText: status === 404 ? "Not Found" : "OK",
		headers: { "Content-Type": "application/json" },
	});

describe("OAuth and transport", () => {
	afterEach(() => jest.restoreAllMocks());

	it("generates an authorization URL with typed scopes", () => {
		const kickClient = new client({ clientId: "id", clientSecret: "secret", redirectUri: "https://app/callback" });
		const url = new URL(
			kickClient.getAuthorizationUrl(
				{ codeVerifier: "verifier", codeChallenge: "challenge", state: "state" },
				["user:read", "channel:read"],
			),
		);
		expect(url.searchParams.get("scope")).toBe("user:read channel:read");
		expect(url.searchParams.get("state")).toBe("state");
		expect(() =>
			kickClient.getAuthorizationUrl(
				{ codeVerifier: "verifier", codeChallenge: "challenge", state: "" },
				["user:read"],
			),
		).toThrow("state is required");
	});

	it("exchanges a code for a classified user token", async () => {
		jest.spyOn(global, "fetch").mockResolvedValue(
			jsonResponse({
				access_token: "access",
				token_type: "Bearer",
				expires_in: 3600,
				refresh_token: "refresh",
				refresh_expires_in: 7200,
			}),
		);
		const kickClient = new client({ clientId: "id", clientSecret: "secret", redirectUri: "https://app/callback" });

		await expect(kickClient.exchangeCodeForToken({ code: "code", codeVerifier: "verifier" })).resolves.toMatchObject({
			kind: "user",
			accessToken: "access",
			refreshToken: "refresh",
			refreshExpiresIn: 7200,
		});
	});

	it("refreshes an expired user token before an API request", async () => {
		const fetchMock = jest
			.spyOn(global, "fetch")
			.mockResolvedValueOnce(
				jsonResponse({ access_token: "new", token_type: "Bearer", expires_in: 3600, refresh_token: "refresh-2" }),
			)
			.mockResolvedValueOnce(jsonResponse({ data: [] }));
		const kickClient = new client({ clientId: "id", clientSecret: "secret", redirectUri: "https://app/callback" });
		const expiredToken: UserOAuthToken = {
			kind: "user",
			accessToken: "expired",
			tokenType: "Bearer",
			expiresIn: 1,
			expiresAt: Date.now() - 1,
			refreshToken: "refresh-1",
		};
		kickClient.setToken(expiredToken);

		await kickClient.users.getUsers();
		expect(fetchMock.mock.calls[0][0]).toBe("https://id.kick.com/oauth/token");
		expect(fetchMock.mock.calls[1][1]?.headers).toMatchObject({ Authorization: "Bearer new" });
	});

	it("revokes tokens and introspects the active token", async () => {
		const fetchMock = jest
			.spyOn(global, "fetch")
			.mockResolvedValueOnce(new Response(null, { status: 200 }))
			.mockResolvedValueOnce(jsonResponse({ data: { active: true, token_type: "app" } }));
		const kickClient = new client({ clientId: "id", clientSecret: "secret" });
		kickClient.setToken({
			kind: "app",
			accessToken: "access",
			tokenType: "Bearer",
			expiresIn: 3600,
			expiresAt: Date.now() + 3600_000,
		});

		await kickClient.revokeToken("access", "access_token");
		await expect(kickClient.introspectToken()).resolves.toMatchObject({ active: true });
		expect(fetchMock.mock.calls[0][0]).toBe("https://id.kick.com/oauth/revoke?token=access&token_type_hint=access_token");
	});

	it("maps HTTP and network errors to library errors", async () => {
		const kickClient = new client({ clientId: "id", clientSecret: "secret" });
		kickClient.setToken({
			kind: "app",
			accessToken: "access",
			tokenType: "Bearer",
			expiresIn: 3600,
			expiresAt: Date.now() + 3600_000,
		});
		jest.spyOn(global, "fetch").mockResolvedValueOnce(jsonResponse({ message: "missing" }, 404));
		await expect(kickClient.users.getUsers()).rejects.toBeInstanceOf(KickNotFoundError);

		jest.spyOn(global, "fetch").mockRejectedValueOnce(new Error("offline"));
		await expect(kickClient.users.getUsers()).rejects.toBeInstanceOf(KickNetworkError);
	});
});
