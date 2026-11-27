export type FetchLike = (
  input: string,
  init?: RequestInit
) => Promise<Response>;

export interface ApiClientOptions {
  baseUrl: string;
  fetch?: FetchLike;
}

export interface ApiClient {
  get(path: string): Promise<unknown>;
  post(path: string, body: unknown): Promise<unknown>;
  postForm(
    path: string,
    body: FormData,
    signal?: AbortSignal
  ): Promise<unknown>;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status: number, message?: string) {
    super(message ?? code);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

async function readErrorCode(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === "string") {
      return body.error;
    }
  } catch {
    // Not a JSON error body; fall through to the generic code.
  }

  return "http_error";
}

export function createApiClient({
  baseUrl,
  fetch: fetchImpl,
}: ApiClientOptions): ApiClient {
  const base = baseUrl.replace(/\/+$/, "");

  async function request(path: string, init: RequestInit): Promise<unknown> {
    let response: Response;

    try {
      response = fetchImpl
        ? await fetchImpl(`${base}${path}`, init)
        : await globalThis.fetch(`${base}${path}`, init);
    } catch {
      throw new ApiError(
        "network_error",
        0,
        "Could not reach the Memento API."
      );
    }

    if (!response.ok) {
      throw new ApiError(await readErrorCode(response), response.status);
    }

    return response.json();
  }

  return {
    get: (path) => request(path, { headers: { accept: "application/json" } }),
    post: (path, body) =>
      request(path, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      }),
    postForm: (path, body, signal) =>
      request(path, {
        method: "POST",
        headers: { accept: "application/json" },
        body,
        signal,
      }),
  };
}
