export type RequestFn = <T>(endpoint: string, options?: RequestInit) => Promise<T>;

export interface KickClientConfig {
	clientId: string;
	clientSecret: string;
	redirectUri?: string;
	baseUrl?: string;
	oauthUrl?: string;
	debug?: boolean;
}

export interface OAuthAuthorizationParams {
	codeVerifier: string;
	codeChallenge: string;
	state?: string;
}

export interface OAuthTokenRequest {
	code: string;
	codeVerifier: string;
}

export interface OAuthToken {
	accessToken: string;
	tokenType: string;
	expiresIn: number;
	refreshToken?: string;
	scope?: string;
	expiresAt: number;
}

export interface ApiResponse<T> {
	data: T;
	message: string;
}

export interface Category {
	id: number;
	name: string;
	thumbnail: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	message: string;
}

export interface User {
	id: number;
	username: string;
	slug: string;
	bio?: string;
	country?: string;
	state?: string;
	city?: string;
	instagram?: string;
	twitter?: string;
	youtube?: string;
	discord?: string;
	tiktok?: string;
	facebook?: string;
}

export interface Channel {
	id: number;
	user_id: number;
	slug: string;
	is_banned: boolean;
	playback_url: string;
	name_updated_at?: string;
	vod_enabled: boolean;
	subscription_enabled: boolean;
	cf_rate_limiting: boolean;
	followers_count: number;
	subscriber_badges: any[];
	banner_image?: string;
	offline_banner_image?: string;
	can_host: boolean;
	user: User;
	category?: Category;
	muted: boolean;
	follower_badges: any[];
	offline_banner?: string;
	verified: boolean;
	recent_categories: Category[];
}

export interface Livestream {
	id: number;
	slug: string;
	channel_id: number;
	created_at: string;
	session_title: string;
	is_live: boolean;
	risk_level_id: number;
	start_time: string;
	source?: any;
	twitch_channel?: any;
	duration: number;
	language: string;
	is_mature: boolean;
	viewer_count: number;
	thumbnail?: string;
	viewers: number;
	category: Category;
	tags: string[];
}
