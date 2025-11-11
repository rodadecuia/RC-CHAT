"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION immutable_unaccent(text)
      RETURNS text AS $$
      SELECT unaccent($1);
      $$ LANGUAGE sql IMMUTABLE;
    `);
    },
    down: async (queryInterface) => {
        await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS immutable_unaccent(text);
    `);
    }
};
