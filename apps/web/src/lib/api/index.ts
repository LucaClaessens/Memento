import { env } from "$env/dynamic/public";
import { createApiClient } from "./client";
import { createEntriesApi } from "./entries";

export type { EntriesApi } from "./entries";

const client = createApiClient({
  baseUrl: env.PUBLIC_API_URL ?? "http://localhost:8787",
});

export const entriesApi = createEntriesApi(client);
