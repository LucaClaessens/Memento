/** The message of an unknown thrown value, safe to return in an error body. */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
