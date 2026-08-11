import type { Category, ChannelRewardRedemptionStatus, KickEventName } from "./types";

export interface WebhookBadge {
	text: string;
	type: string;
	count?: number;
}

export interface WebhookIdentity {
	username_color: string;
	badges: WebhookBadge[];
}

export interface WebhookUser {
	is_anonymous?: boolean;
	user_id: number | null;
	username: string | null;
	is_verified: boolean | null;
	profile_picture: string | null;
	channel_slug: string | null;
	identity?: WebhookIdentity | null;
}

export interface ChatMessageWebhookPayload {
	message_id: string;
	replies_to: { message_id: string; content: string; sender: WebhookUser } | null;
	broadcaster: WebhookUser;
	sender: WebhookUser;
	content: string;
	emotes: Array<{ emote_id: string; positions: Array<{ s: number; e: number }> }>;
	created_at: string;
}

export interface ChannelFollowedWebhookPayload {
	broadcaster: WebhookUser;
	follower: WebhookUser;
}

export interface ChannelSubscriptionWebhookPayload {
	broadcaster: WebhookUser;
	subscriber: WebhookUser;
	duration: number;
	created_at: string;
	expires_at: string;
}

export interface ChannelSubscriptionGiftsWebhookPayload {
	broadcaster: WebhookUser;
	gifter: WebhookUser;
	giftees: WebhookUser[];
	created_at: string;
	expires_at: string;
}

export interface ChannelRewardRedemptionWebhookPayload {
	id: string;
	user_input: string;
	status: ChannelRewardRedemptionStatus;
	redeemed_at: string;
	reward: { id: string; title: string; cost: number; description: string };
	redeemer: WebhookUser;
	broadcaster: WebhookUser;
}

export interface LivestreamStatusWebhookPayload {
	broadcaster: WebhookUser;
	is_live: boolean;
	title: string;
	started_at: string;
	ended_at: string | null;
}

export interface LivestreamMetadataWebhookPayload {
	broadcaster: WebhookUser;
	metadata: { title: string; language: string; has_mature_content: boolean; category: Category };
}

export interface ModerationBannedWebhookPayload {
	broadcaster: WebhookUser;
	moderator: WebhookUser;
	banned_user: WebhookUser;
	metadata: { reason: string; created_at: string; expires_at: string | null };
}

export interface KicksGiftedWebhookPayload {
	broadcaster: WebhookUser;
	sender: WebhookUser;
	gift: {
		amount: number;
		name: string;
		type: string;
		tier: string;
		message: string;
		pinned_time_seconds: number;
	};
	created_at: string;
}

export interface KickWebhookPayloadMap {
	"chat.message.sent": ChatMessageWebhookPayload;
	"channel.followed": ChannelFollowedWebhookPayload;
	"channel.subscription.renewal": ChannelSubscriptionWebhookPayload;
	"channel.subscription.gifts": ChannelSubscriptionGiftsWebhookPayload;
	"channel.subscription.new": ChannelSubscriptionWebhookPayload;
	"channel.reward.redemption.updated": ChannelRewardRedemptionWebhookPayload;
	"livestream.status.updated": LivestreamStatusWebhookPayload;
	"livestream.metadata.updated": LivestreamMetadataWebhookPayload;
	"moderation.banned": ModerationBannedWebhookPayload;
	"kicks.gifted": KicksGiftedWebhookPayload;
}

export type KickWebhookPayload<T extends KickEventName> = KickWebhookPayloadMap[T];
