export function friendlyError(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("repository not found")) return "That repository was not found or is private.";
  if (message.includes("github rate limit"))
    return "GitHub is rate-limiting requests. Add GITHUB_TOKEN on the server or try again later.";
  if (
    status === 401 ||
    message.includes("unauthorized") ||
    message.includes("invalid api") ||
    message.includes("api key not valid") ||
    message.includes("api_key_invalid")
  )
    return "That API key was rejected. Check it and try again.";
  if (status === 429 || message.includes("rate limit"))
    return "The provider is rate-limiting requests. Wait a moment and try again.";
  if (message.includes("quota") || message.includes("billing"))
    return "This provider account has no available quota.";
  if (message.includes("model") && (message.includes("not found") || message.includes("does not exist")))
    return "That model was not found. Choose another model name.";
  return "The provider could not complete the request. Check the settings and try again.";
}
