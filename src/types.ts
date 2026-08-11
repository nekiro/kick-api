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

export type KickScope =
	| "user:read"
	| "channel:read"
	| "channel:write"
	| "channel:rewards:read"
	| "channel:rewards:write"
	| "chat:write"
	| "streamkey:read"
	| "events:subscribe"
	| "moderation:ban"
	| "moderation:chat_message:manage"
	| "kicks:read";

export interface OAuthTokenBase {
	accessToken: string;
	tokenType: string;
	expiresIn: number;
	scope?: string;
	expiresAt: number;
}

export interface AppOAuthToken extends OAuthTokenBase {
	kind: "app";
	refreshToken?: never;
	refreshExpiresIn?: never;
	refreshExpiresAt?: never;
}

export interface UserOAuthToken extends OAuthTokenBase {
	kind: "user";
	refreshToken: string;
	refreshExpiresIn?: number;
	refreshExpiresAt?: number;
}

export type OAuthToken = AppOAuthToken | UserOAuthToken;

export type OAuthTokenTypeHint = "access_token" | "refresh_token";

export interface TokenIntrospection {
	active: boolean;
	client_id?: string;
	exp?: number;
	scope?: string;
	token_type?: "app" | "user" | string;
}

export interface Category {
	id: number;
	name: string;
	thumbnail: string;
}

export interface CategoryDetail extends Category {
	tags: string[];
	viewer_count: number;
}

export interface CategoryV2 extends Category {
	tags: string[];
}

export interface Pagination {
	next_cursor: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	message: string;
	pagination: Pagination;
}

/** User returned by GET /public/v1/users. */
export interface User {
	user_id: number;
	name: string;
	email?: string;
	profile_picture: string;
}

export interface ChannelStream {
	custom_tags: string[];
	is_live: boolean;
	is_mature: boolean;
	key: string;
	language: string;
	start_time: string;
	thumbnail: string;
	url: string;
	viewer_count: number;
}

export interface Channel {
	broadcaster_user_id: number;
	slug: string;
	stream_title: string;
	channel_description: string;
	banner_picture: string;
	category: Category;
	stream: ChannelStream;
	active_subscribers_count?: number;
	active_gifted_subscribers_count?: number;
	canceled_subscribers_count?: number;
}

/** @deprecated Kick deprecated GET /public/v1/livestreams. Use LivestreamV2. */
export interface Livestream {
	broadcaster_user_id: number;
	category: Category;
	channel_id: number;
	custom_tags: string[];
	has_mature_content: boolean;
	language: string;
	profile_picture: string;
	slug: string;
	started_at: string;
	stream_title: string;
	thumbnail: string;
	viewer_count: number;
}

export interface LivestreamV2User {
	id: number;
	username: string;
	profile_picture: string;
}

export interface LivestreamV2 {
	id: string;
	broadcaster_user: LivestreamV2User;
	category: Category;
	channel: { slug: string };
	has_mature_content: boolean;
	language_code: string;
	started_at: string;
	tags: string[];
	thumbnail: string;
	title: string;
	viewer_count: number;
}

export interface LivestreamStats {
	total_count: number;
}

export interface CategoriesV2Params {
	cursor?: string;
	limit?: number;
	name?: string[];
	tag?: string[];
	id?: number[];
}

export interface LivestreamsV2Params {
	category_id?: number[];
	language_code?: string[];
	limit?: number;
	cursor?: string;
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

export type ChannelRewardRedemptionStatus = "pending" | "accepted" | "rejected";

export interface ChannelReward {
	id: string;
	title: string;
	description: string;
	cost: number;
	background_color: string;
	is_enabled: boolean;
	is_paused: boolean;
	is_user_input_required: boolean;
	should_redemptions_skip_request_queue: boolean;
}

export interface CreateChannelRewardRequest {
	title: string;
	cost: number;
	description?: string;
	background_color?: string;
	is_enabled?: boolean;
	is_user_input_required?: boolean;
	should_redemptions_skip_request_queue?: boolean;
}

export type UpdateChannelRewardRequest = Partial<CreateChannelRewardRequest> & { is_paused?: boolean };

export interface ChannelRewardRedemption {
	id: string;
	redeemed_at: string;
	redeemer: { user_id: number };
	status: ChannelRewardRedemptionStatus;
	user_input: string;
}

export interface RedemptionsByReward {
	reward: {
		id: string;
		title: string;
		cost?: number;
		description?: string;
		can_manage?: boolean;
		is_deleted?: boolean;
	};
	redemptions: ChannelRewardRedemption[];
}

export interface FailedRedemption {
	id: string;
	reason: "UNKNOWN" | "NOT_PENDING" | "NOT_FOUND" | "NOT_OWNED";
}

export interface EventSubscriptionRequest {
	broadcaster_user_id?: number;
	events: Array<{ name: KickEventName; version: 1 | number }>;
	method?: "webhook";
}

export type KickEventName =
	| "chat.message.sent"
	| "channel.followed"
	| "channel.subscription.renewal"
	| "channel.subscription.gifts"
	| "channel.subscription.new"
	| "channel.reward.redemption.updated"
	| "livestream.status.updated"
	| "livestream.metadata.updated"
	| "moderation.banned"
	| "kicks.gifted";

export interface EventSubscriptionResult {
	name: string;
	version: number;
	subscription_id?: string;
	error?: string;
}

export interface EventSubscription {
	id: string;
	app_id: string;
	broadcaster_user_id: number;
	event: string;
	version: number;
	method: string;
	created_at: string;
	updated_at: string;
}

export interface ModerationBanRequest {
	broadcaster_user_id: number;
	user_id: number;
	duration?: number;
	reason?: string;
}

export interface ModerationUnbanRequest {
	broadcaster_user_id: number;
	user_id: number;
}

export interface KicksLeaderboardEntry {
	gifted_amount: number;
	rank: number;
	user_id: number;
	username: string;
}

export interface KicksLeaderboard {
	lifetime: KicksLeaderboardEntry[];
	month: KicksLeaderboardEntry[];
	week: KicksLeaderboardEntry[];
}
