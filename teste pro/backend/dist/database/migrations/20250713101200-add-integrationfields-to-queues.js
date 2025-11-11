"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.addColumn("Queues", "visibleToIntegrations", {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        });
        await queryInterface.addColumn("Queues", "description", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn("Queues", "visibleToIntegrations");
        await queryInterface.removeColumn("Queues", "description");
    }
};
