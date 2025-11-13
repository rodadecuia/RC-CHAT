import axios from "axios";
import { getBackendURL } from "../services/config";

const api = axios.create({
    baseURL: getBackendURL(),
    withCredentials: true,
});

// Interceptor para normalizar URLs iniciadas com "/"
// Quando a url começa com "/", o Axios ignora o path do baseURL e usa apenas a origem,
// o que faria as chamadas irem para "/..." ao invés de "/backend/...".
// Ao remover o "/" inicial, mantemos o path do baseURL (ex.: "/backend").
const stripLeadingSlash = (instance) => {
    instance.interceptors.request.use((config) => {
        if (typeof config.url === "string" && config.url.startsWith("/")) {
            config.url = config.url.slice(1);
        }
        return config;
    });
};

stripLeadingSlash(api);

export const openApi = axios.create({
    baseURL: getBackendURL()
});

stripLeadingSlash(openApi);

export default api;
