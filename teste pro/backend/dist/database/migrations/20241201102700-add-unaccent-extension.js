"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: (queryInterface) => {
        return Promise.all([
            queryInterface.sequelize.query("CREATE EXTENSION IF NOT EXISTS unaccent")
        ]);
    },
    down: _ => {
        return Promise.resolve();
    }
};
