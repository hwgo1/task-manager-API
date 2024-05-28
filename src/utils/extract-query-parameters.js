export function extractQueryParameters(queryString) {
  return Object.fromEntries(new URLSearchParams(queryString));
}
