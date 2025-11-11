import { Agent } from "https";
import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";

export function GetProxyAgent(): Agent | undefined {
  const proxyUrl = process.env.PROXY_URL;
  const proxyType = process.env.PROXY_TYPE;

  if (!proxyUrl) {
    return undefined;
  }

  if (proxyType === "https-proxy") {
    return new HttpsProxyAgent(proxyUrl);
  }

  if (proxyType === "socks-proxy") {
    return new SocksProxyAgent(proxyUrl);
  }

  // If no type is specified, try to infer from the URL scheme
  if (proxyUrl.startsWith("https")) {
    return new HttpsProxyAgent(proxyUrl);
  }

  if (proxyUrl.startsWith("socks")) {
    return new SocksProxyAgent(proxyUrl);
  }

  // Default to undefined if the type is unknown or not specified
  return undefined;
}
