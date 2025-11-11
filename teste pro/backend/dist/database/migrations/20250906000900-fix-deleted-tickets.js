"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: async (queryInterface) => {
        return queryInterface.sequelize.query("UPDATE \"Tickets\" SET status = 'closed' WHERE status = 'deleted'");
    },
    down: async () => {
        // no-op
    }
};
