import { KickClient } from "./client.ts";

export type Client = Omit<KickClient, "request">;

export const client = KickClient as new (config: import("./types.ts").KickClientConfig) => Client;

export * from "./types.ts";
export * from "./errors.ts";
