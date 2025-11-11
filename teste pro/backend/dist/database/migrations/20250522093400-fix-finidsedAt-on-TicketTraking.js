"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(`
      UPDATE "TicketTraking"
        SET "finishedAt" = "ratingAt"
        WHERE "ratingAt" IS NOT NULL;
    `);
    },
    down: async () => {
        // no operation
    }
};
