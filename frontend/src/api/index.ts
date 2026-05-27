import { httpApi } from "./http";
import { mockApi } from "./mock";

// flip VITE_USE_MOCK to "false" (or just set VITE_API_URL) when the backend is live.
// everything in the app imports `api` from here, so the swap is one line of env.
export const api = import.meta.env.VITE_USE_MOCK === "false" ? httpApi : mockApi;

export * from "./types";
