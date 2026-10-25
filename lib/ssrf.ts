import dns from "node:dns/promises";
import net from "node:net";

const stripBrackets = (host: string) => host.replace(/^\[|\]$/g, "");

/** True for loopback, private, link-local, CGNAT, multicast and unspecified addresses (IPv4 and IPv6). */
export function privateAddress(address: string): boolean {
  let ip = stripBrackets(address).toLowerCase();

  // IPv4-mapped IPv6, in dotted form (::ffff:127.0.0.1) or hex form (::ffff:7f00:1, what URL() produces).
  const dotted = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) ip = dotted[1];
  const hex = ip.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const hi = parseInt(hex[1], 16);
    const lo = parseInt(hex[2], 16);
    ip = `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`;
  }

  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  if (net.isIPv6(ip)) {
    return ip === "::" || ip === "::1" || /^f[cd]/.test(ip) || /^fe[89ab]/.test(ip);
  }
  return false;
}

export async function validateBaseUrl(
  value: unknown,
  allowPrivate = process.env.ALLOW_PRIVATE_BASE_URLS === "true",
): Promise<string> {
  let url: URL;
  try {
    url = new URL(String(value));
  } catch {
    throw new Error("Enter a valid custom base URL");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Custom base URL must use HTTPS");
  if (url.username || url.password) throw new Error("Custom base URL must not contain credentials");

  if (!allowPrivate) {
    if (url.protocol !== "https:") throw new Error("Custom base URL must use HTTPS");
    const host = stripBrackets(url.hostname);
    if (host === "localhost" || host.endsWith(".localhost")) throw new Error("Private base URLs are not allowed");
    if (net.isIP(host)) {
      if (privateAddress(host)) throw new Error("Private base URLs are not allowed");
    } else {
      let addresses: { address: string }[];
      try {
        addresses = await dns.lookup(host, { all: true });
      } catch {
        throw new Error("Could not resolve the custom base URL host");
      }
      if (addresses.some(({ address }) => privateAddress(address))) throw new Error("Private base URLs are not allowed");
    }
  }
  return url.toString().replace(/\/$/, "");
}
