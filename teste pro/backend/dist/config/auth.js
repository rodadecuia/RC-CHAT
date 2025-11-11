"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("../libs/cache");
const logger_1 = require("../utils/logger");
const CACHE_KEY_JWT_SECRET = "TICKETZ_JWT_SECRET";
const CACHE_KEY_JWT_REFRESH_SECRET = "TICKETZ_JWT_REFRESH_SECRET";
function generateSecret(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
    let secret = "";
    for (let i = 0; i < length; i += 1) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        secret += charset[randomIndex];
    }
    return secret;
}
async function generateSecretIfNotExists(cacheKey) {
    let secret = await cache_1.cacheLayer.get(cacheKey);
    if (!secret) {
        secret = generateSecret(32);
        await cache_1.cacheLayer.set(cacheKey, secret);
        logger_1.logger.debug(`[auth.ts] Generated ${cacheKey}`);
    }
    else {
        logger_1.logger.debug(`[auth.ts] Loaded ${cacheKey}`);
    }
    return secret;
}
const jwtConfig = {
    secret: null,
    expiresIn: "15m",
    refreshSecret: null,
    refreshExpiresIn: "7d"
};
const secretPromise = generateSecretIfNotExists(CACHE_KEY_JWT_SECRET);
const refreshSecretPromise = generateSecretIfNotExists(CACHE_KEY_JWT_REFRESH_SECRET);
Promise.all([secretPromise, refreshSecretPromise]).then(([secret, refreshSecret]) => {
    jwtConfig.secret = secret;
    jwtConfig.refreshSecret = refreshSecret;
});
exports.default = jwtConfig;
