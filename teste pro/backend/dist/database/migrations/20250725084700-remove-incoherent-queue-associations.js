"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(`
      UPDATE "Tickets"
      SET "queueId" = NULL
      WHERE "queueId" IS NOT NULL
        AND "companyId" != (SELECT "companyId" FROM "Queues" WHERE "id" = "Tickets"."queueId");
    `);
    },
    down: async () => {
        // no-op
    }
};
