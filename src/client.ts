import {
	KickClientConfig,
	KickScope,
	OAuthAuthorizationParams,
	OAuthToken,
	OAuthTokenRequest,
	OAuthTokenTypeHint,
	TokenIntrospection,
	UserOAuthToken,
} from "./types";
import { CategoriesModule } from "./modules/categories";
import { ChannelsModule } from "./modules/channels";
import { LivestreamsModule } from "./modules/livestreams";
import { ChatModule } from "./modules/chat";
import { UsersModule } from "./modules/users";
import { ModerationModule } from "./modules/moderation";
import { EventsModule } from "./modules/events";
import { ChannelRewardsModule } from "./modules/channel-rewards";
import { KicksModule } from "./modules/kicks";
import { PublicKeyModule } from "./modules/public-key";
import { KickApiError, KickOAuthError, createKickError, KickNetworkError } from "./errors";
import { randomBytes, createHash } from "crypto";

interface OAuthTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token?: string;
	refresh_expires_in?: number;
	scope?: string;
}

export class KickClient {
	private config: KickClientConfig;
	private token: OAuthToken | null = null;
	private tokenPromise: Promise<string> | null = null;

	public readonly categories: CategoriesModule;
	public readonly channels: ChannelsModule;
	public readonly livestreams: LivestreamsModule;
	public readonly chat: ChatModule;
	public readonly users: UsersModule;
	public readonly moderation: ModerationModule;
	public readonly events: EventsModule;
	public readonly channelRewards: ChannelRewardsModule;
	public readonly kicks: KicksModule;
	public readonly publicKey: PublicKeyModule;

	constructor(config: KickClientConfig) {
		this.config = {
			baseUrl: "https://api.kick.com",
			oauthUrl: "https://id.kick.com",
			...config,
		};

		this.categories = new CategoriesModule(this);
		this.channels = new ChannelsModule(this);
		this.livestreams = new LivestreamsModule(this);
		this.chat = new ChatModule(this);
		this.users = new UsersModule(this);
		this.moderation = new ModerationModule(this);
		this.events = new EventsModule(this);
		this.channelRewards = new ChannelRewardsModule(this);
		this.kicks = new KicksModule(this);
		this.publicKey = new PublicKeyModule(this);
	}

	generatePKCEParams(): OAuthAuthorizationParams {
		const codeVerifier = randomBytes(32).toString("base64url");
		const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
		const state = randomBytes(16).toString("hex");

		return {
			codeVerifier,
			codeChallenge,
			state,
		};
	}

	getAuthorizationUrl(params: OAuthAuthorizationParams, scopes: readonly KickScope[] = ["user:read"]): string {
		if (!this.config.redirectUri) {
			throw new Error(
				"redirectUri is required for user authentication flow. For server-to-server, tokens are handled automatically.",
			);
		}

		const url = new URL(`${this.config.oauthUrl}/oauth/authorize`);

		url.searchParams.set("response_type", "code");
		url.searchParams.set("client_id", this.config.clientId);
		url.searchParams.set("redirect_uri", this.config.redirectUri);
		url.searchParams.set("scope", scopes.join(" "));
		url.searchParams.set("code_challenge", params.codeChallenge);
		url.searchParams.set("code_challenge_method", "S256");

		if (params.state) {
			url.searchParams.set("state", params.state);
		}

		return url.toString();
	}

	async exchangeCodeForToken(tokenRequest: OAuthTokenRequest): Promise<UserOAuthToken> {
		if (!this.config.redirectUri) {
			throw new Error(
				"redirectUri is required for authorization code flow. For server-to-server, tokens are handled automatically.",
			);
		}

		try {
			const body = new URLSearchParams({
				grant_type: "authorization_code",
				client_id: this.config.clientId,
				client_secret: this.config.clientSecret,
				redirect_uri: this.config.redirectUri,
				code_verifier: tokenRequest.codeVerifier,
				code: tokenRequest.code,
			});

			const response = await fetch(`${this.config.oauthUrl}/oauth/token`, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: body.toString(),
			});

			if (this.config.debug) {
				console.log("🔍 Debug - OAuth Token Request:");
				console.log("URL:", `${this.config.oauthUrl}/oauth/token`);
				console.log("Grant type: authorization_code (credentials redacted)");
			}

			if (!response.ok) {
				let responseBody;
				try {
					responseBody = await response.text();
					try {
						responseBody = JSON.parse(responseBody);
					} catch {}
				} catch {
					responseBody = "Unable to read response body";
				}

				if (this.config.debug) {
					console.log("🔍 Debug - OAuth Error Response:");
					console.log("Status:", response.status, response.statusText);
					console.log("Body:", responseBody);
				}

				throw new KickOAuthError(
					`Token exchange failed: ${response.status} ${response.statusText}`,
					response.status,
					responseBody,
				);
			}

			const data = (await response.json()) as OAuthTokenResponse;
			if (!data.refresh_token) {
				throw new KickOAuthError("Token response did not include a refresh token", 500, data);
			}

			this.token = {
				kind: "user",
				accessToken: data.access_token,
				tokenType: data.token_type,
				expiresIn: data.expires_in,
				refreshToken: data.refresh_token,
				refreshExpiresIn: data.refresh_expires_in,
				scope: data.scope,
				expiresAt: Date.now() + data.expires_in * 1000,
				refreshExpiresAt: data.refresh_expires_in
					? Date.now() + data.refresh_expires_in * 1000
					: undefined,
			};

			return this.token;
		} catch (error) {
			if (error instanceof KickOAuthError) {
				throw error;
			}
			throw new KickNetworkError("Failed to connect to OAuth endpoint", error as Error);
		}
	}

	setToken(token: OAuthToken): void {
		this.token = token;
	}

	async introspectToken(): Promise<TokenIntrospection> {
		return this.request<TokenIntrospection>("/oauth/token/introspect", { method: "POST" });
	}

	async revokeToken(token: string, tokenTypeHint?: OAuthTokenTypeHint): Promise<void> {
		const searchParams = new URLSearchParams({ token });
		if (tokenTypeHint) searchParams.set("token_type_hint", tokenTypeHint);

		const response = await fetch(`${this.config.oauthUrl}/oauth/revoke?${searchParams.toString()}`, {
			method: "POST",
		});

		if (!response.ok) {
			throw new KickOAuthError(`Token revocation failed: ${response.status} ${response.statusText}`, response.status);
		}
	}

	private async getAccessToken(): Promise<string> {
		if (this.tokenPromise) {
			return this.tokenPromise;
		}

		if (this.token && this.isTokenValid()) {
			return this.token.accessToken;
		}

		this.tokenPromise = this.autoRefreshToken();
		try {
			const token = await this.tokenPromise;
			return token;
		} finally {
			this.tokenPromise = null;
		}
	}

	private async autoRefreshToken(): Promise<string> {
		if (this.token?.refreshToken) {
			try {
				return await this.refreshAccessToken();
			} catch (error) {
				if (this.config.debug) {
					console.log("🔄 Token refresh failed, getting new token:", (error as Error).message);
				}
			}
		}

		if (!this.config.redirectUri) {
			return await this.getClientCredentialsToken();
		}

		throw new KickOAuthError(
			"No valid token available. For user authentication, use exchangeCodeForToken() first. For server-to-server, omit redirectUri from config.",
			401,
		);
	}

	private async getClientCredentialsToken(): Promise<string> {
		try {
			const body = new URLSearchParams({
				grant_type: "client_credentials",
				client_id: this.config.clientId,
				client_secret: this.config.clientSecret,
			});

			const response = await fetch(`${this.config.oauthUrl}/oauth/token`, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: body.toString(),
			});

			if (this.config.debug) {
				console.log("🔍 Debug - Client Credentials Request:");
				console.log("URL:", `${this.config.oauthUrl}/oauth/token`);
				console.log("Grant type: client_credentials (credentials redacted)");
			}

			if (!response.ok) {
				let responseBody;
				try {
					responseBody = await response.text();
					try {
						responseBody = JSON.parse(responseBody);
					} catch {}
				} catch {
					responseBody = "Unable to read response body";
				}

				if (this.config.debug) {
					console.log("🔍 Debug - Client Credentials Error:");
					console.log("Status:", response.status, response.statusText);
					console.log("Body:", responseBody);
				}

				throw new KickOAuthError(
					`Client credentials token request failed: ${response.status} ${response.statusText}`,
					response.status,
					responseBody,
				);
			}

			const data = (await response.json()) as OAuthTokenResponse;

			this.token = {
				kind: "app",
				accessToken: data.access_token,
				tokenType: data.token_type,
				expiresIn: data.expires_in,
				scope: data.scope,
				expiresAt: Date.now() + data.expires_in * 1000,
			};

			return this.token.accessToken;
		} catch (error) {
			if (error instanceof KickOAuthError) {
				throw error;
			}
			throw new KickNetworkError("Failed to get client credentials token", error as Error);
		}
	}

	private isTokenValid(): boolean {
		if (!this.token) return false;
		return Date.now() < this.token.expiresAt - 60000;
	}

	private async refreshAccessToken(): Promise<string> {
		if (!this.token?.refreshToken) {
			throw new KickOAuthError("No refresh token available", 401);
		}

		try {
			const body = new URLSearchParams({
				grant_type: "refresh_token",
				client_id: this.config.clientId,
				client_secret: this.config.clientSecret,
				refresh_token: this.token.refreshToken,
			});

			const response = await fetch(`${this.config.oauthUrl}/oauth/token`, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: body.toString(),
			});

			if (!response.ok) {
				let responseBody;
				try {
					responseBody = await response.text();
					try {
						responseBody = JSON.parse(responseBody);
					} catch {}
				} catch {
					responseBody = "Unable to read response body";
				}

				if (this.config.debug) {
					console.log("🔍 Debug - OAuth Refresh Error:");
					console.log("Status:", response.status, response.statusText);
					console.log("Body:", responseBody);
				}

				throw new KickOAuthError(
					`Token refresh failed: ${response.status} ${response.statusText}`,
					response.status,
					responseBody,
				);
			}

			const data = (await response.json()) as OAuthTokenResponse;
			const refreshToken = data.refresh_token || this.token.refreshToken;

			this.token = {
				kind: "user",
				accessToken: data.access_token,
				tokenType: data.token_type,
				expiresIn: data.expires_in,
				refreshToken,
				refreshExpiresIn: data.refresh_expires_in,
				scope: data.scope,
				expiresAt: Date.now() + data.expires_in * 1000,
				refreshExpiresAt: data.refresh_expires_in
					? Date.now() + data.refresh_expires_in * 1000
					: this.token.refreshExpiresAt,
			};

			return this.token.accessToken;
		} catch (error) {
			if (error instanceof KickOAuthError) {
				throw error;
			}
			throw new KickNetworkError("Failed to refresh token", error as Error);
		}
	}

	async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const response = await this.requestEnvelope<{ data: T }>(endpoint, options);
		return response?.data as T;
	}

	async requestEnvelope<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		try {
			const accessToken = await this.getAccessToken();
			const url = `${this.config.baseUrl}${endpoint}`;

			const response = await fetch(url, {
				...options,
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: "application/json",
					"Content-Type": "application/json",
					...options.headers,
				},
			});

			if (!response.ok) {
				let responseBody;
				try {
					responseBody = await response.text();

					try {
						responseBody = JSON.parse(responseBody);
					} catch {}
				} catch {
					responseBody = "Unable to read response body";
				}

				const headers = Object.fromEntries(response.headers.entries());

				if (this.config.debug) {
					console.log("🔍 Debug - API Error Response:");
					console.log("Status:", response.status, response.statusText);
					console.log("Headers:", headers);
					console.log("Body:", responseBody);
					console.log("Endpoint:", endpoint);
				}

				throw createKickError(response.status, response.statusText, responseBody, headers, endpoint);
			}

			if (response.status === 204 || response.status === 205) {
				return undefined as T;
			}

			const body = await response.text();
			if (!body) return undefined as T;

			return JSON.parse(body) as T;
		} catch (error) {
			if (error instanceof KickApiError || error instanceof KickNetworkError) {
				throw error;
			}

			throw new KickNetworkError(`Request to ${endpoint} failed`, error as Error);
		}
	}
}
