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

export interface Category {
	id: number;
	name: string;
	thumbnail: string;
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
	broadcaster_user_id: number;
	category: Category;
	channel_id: number;
	has_mature_content: boolean;
	language: string;
	slug: string;
	started_at: string;
	stream_title: string;
	thumbnail: string;
	viewer_count: number;
}

export type ChatMessageRequest = ChatBotMessageRequest | ChatUserMessageRequest;

export interface ChatBotMessageRequest {
	type: "bot";
	content: string;
	reply_to_message_id?: string;
}
export interface ChatUserMessageRequest {
	type: "user";
	broadcaster_user_id: number;
	content: string;
	reply_to_message_id?: string;
}

export interface ChatMessageResponse {
	is_sent: boolean;
	message_id: string;
}
