"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        return queryInterface.addColumn("Plans", "currency", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        });
    },
    down: async (queryInterface) => {
        return queryInterface.removeColumn("Plans", "currency");
    }
};
