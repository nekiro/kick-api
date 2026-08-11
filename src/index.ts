import { KickClient } from "./client";

export type Client = Omit<KickClient, "request" | "requestEnvelope">;

export const client = KickClient as new (config: import("./types").KickClientConfig) => Client;

export * from "./types";
export * from "./webhook-types";
export * from "./errors";
export { verifyWebhookSignature } from "./modules/events";
export type { VerifyWebhookSignatureParams } from "./modules/events";
export type { GetRedemptionsParams } from "./modules/channel-rewards";
