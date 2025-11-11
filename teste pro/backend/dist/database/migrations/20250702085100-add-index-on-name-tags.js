"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS unaccent;

      CREATE INDEX tags_name_unaccent_lower_index
      ON "Tags" (immutable_unaccent(LOWER("name")));
    `);
    },
    down: async (queryInterface) => {
        await queryInterface.sequelize.query(`
      DROP INDEX tags_name_unaccent_lower_index;
    `);
    }
};
