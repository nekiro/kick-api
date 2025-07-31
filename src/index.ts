import { KickClient } from "./client";

export type Client = Omit<KickClient, "request">;

export const client = KickClient as new (config: import("./types").KickClientConfig) => Client;

export * from "./types";
export * from "./errors";
