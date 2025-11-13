import { loadJSON } from "../helpers/loadJSON";

// If config.json is not found and the hostname is localhost or 127.0.0 load config-dev.json
let config = loadJSON("/config.json");

if (!config && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
  config = loadJSON("/config-dev.json");
  if (!config) {
    config = {
      "BACKEND_PROTOCOL": "http",
      "BACKEND_HOST": "localhost",
      "BACKEND_PORT": "8080",
      "LOG_LEVEL": "debug"
    };
  }
}

if (!config) {
  throw new Error("Config not found");
}

export function getBackendURL() {
  // Prioriza URL absoluta se fornecida, mas ignora hosts internos/privados
  if (config.REACT_APP_BACKEND_URL) {
    try {
      const u = new URL(config.REACT_APP_BACKEND_URL);
      const host = u.hostname;
      const isLocalLabel = ["backend", "localhost", "127.0.0.1"].includes(host);
      const isPrivateIp = (
        /^10\./.test(host) ||
        /^192\.168\./.test(host) ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
      );
      if (!isLocalLabel && !isPrivateIp) {
        return config.REACT_APP_BACKEND_URL;
      }
      // caso contrário, cai no fallback abaixo
    } catch (e) {
      // URL inválida, usa fallback
    }
  }

  const protocol = config.BACKEND_PROTOCOL ?? "https";
  // Evita usar hosts internos como "backend" / "localhost" no browser público
  const configuredHost = config.BACKEND_HOST;
  const host = (!configuredHost || ["backend", "localhost", "127.0.0.1"].includes(configuredHost))
    ? window.location.hostname
    : configuredHost;

  const sameHost = host === window.location.hostname;
  // Se for o mesmo host do site, não força porta do backend (usa a padrão do navegador)
  const port = (!sameHost && config.BACKEND_PORT) ? `:${config.BACKEND_PORT}` : "";
  // Quando o host for o mesmo do site, por padrão usamos o path "/backend"
  const path = config.BACKEND_PATH ?? (sameHost ? "/backend" : "");

  return `${protocol}://${host}${port}${path}`;
}

export function getBackendSocketURL() {
  if (config.REACT_APP_BACKEND_URL) {
    try {
      const u = new URL(config.REACT_APP_BACKEND_URL);
      const host = u.hostname;
      const isLocalLabel = ["backend", "localhost", "127.0.0.1"].includes(host);
      const isPrivateIp = (
        /^10\./.test(host) ||
        /^192\.168\./.test(host) ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
      );
      if (!isLocalLabel && !isPrivateIp) {
        return config.REACT_APP_BACKEND_URL;
      }
    } catch (e) {
      // ignora e usa fallback
    }
  }

  const protocol = config.BACKEND_PROTOCOL ?? "https";
  const configuredHost = config.BACKEND_HOST;
  const host = (!configuredHost || ["backend", "localhost", "127.0.0.1"].includes(configuredHost))
    ? window.location.hostname
    : configuredHost;

  const sameHost = host === window.location.hostname;
  const port = (!sameHost && config.BACKEND_PORT) ? `:${config.BACKEND_PORT}` : "";
  return `${protocol}://${host}${port}`;
}

export default config;
