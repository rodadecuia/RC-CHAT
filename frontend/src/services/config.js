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
  // Prioriza URL absoluta se fornecida
  if (config.REACT_APP_BACKEND_URL) return config.REACT_APP_BACKEND_URL;

  const protocol = config.BACKEND_PROTOCOL ?? "https";
  // Evita usar hosts internos como "backend" / "localhost" no browser público
  const configuredHost = config.BACKEND_HOST;
  const host = (!configuredHost || ["backend", "localhost", "127.0.0.1"].includes(configuredHost))
    ? window.location.hostname
    : configuredHost;

  const port = config.BACKEND_PORT ? `:${config.BACKEND_PORT}` : "";
  // Quando o host for o mesmo do site, por padrão usamos o path "/backend"
  const path = config.BACKEND_PATH ?? (host === window.location.hostname ? "/backend" : "");

  return `${protocol}://${host}${port}${path}`;
}

export function getBackendSocketURL() {
  if (config.REACT_APP_BACKEND_URL) return config.REACT_APP_BACKEND_URL;

  const protocol = config.BACKEND_PROTOCOL ?? "https";
  const configuredHost = config.BACKEND_HOST;
  const host = (!configuredHost || ["backend", "localhost", "127.0.0.1"].includes(configuredHost))
    ? window.location.hostname
    : configuredHost;

  const port = config.BACKEND_PORT ? `:${config.BACKEND_PORT}` : "";
  return `${protocol}://${host}${port}`;
}

export default config;
