"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.changeColumn("NotificamehubIdMappings", "messageId", {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false
        });
    },
    down: async (queryInterface) => {
        await queryInterface.changeColumn("NotificamehubIdMappings", "messageId", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        });
    }
};
