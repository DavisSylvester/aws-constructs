// Minimal ULID generator for unique IDs (RFC 4122 alternative)
// Not cryptographically secure, but suitable for resource names
export function ulid(): string {
  // Timestamp (48 bits, base32)
  const now = Date.now();
  const time = now.toString(36).padStart(10, "0");
  // Random (80 bits, base32)
  let rand = "";
  for (let i = 0; i < 12; i++) {
    rand += Math.floor(Math.random() * 36).toString(36);
  }
  return `${time}${rand}`.toUpperCase();
}
