"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(`
      UPDATE "Settings"
      SET "value" = 'groq'
      WHERE "key" = 'aiProvider' AND "value" = 'grok';
    `);
    },
    down: async (queryInterface) => {
        await queryInterface.sequelize.query(`
      UPDATE "Settings"
      SET "value" = 'grok'
      WHERE "key" = 'aiProvider' AND "value" = 'groq';
    `);
    }
};
