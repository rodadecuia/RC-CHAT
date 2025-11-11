"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(`UPDATE "Whatsapps"
       SET "extraParameters" = "session"::jsonb
       WHERE "channel" = 'notificamehub'
       AND "session" IS NOT NULL
       AND "session"::jsonb IS NOT NULL`);
    },
    down: async () => {
        // no-op
    }
};
