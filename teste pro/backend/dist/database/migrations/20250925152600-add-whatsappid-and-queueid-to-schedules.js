"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.addColumn("Schedules", "whatsappId", {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Whatsapps",
                key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });
        await queryInterface.addColumn("Schedules", "queueId", {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Queues",
                key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn("Schedules", "whatsappId");
        await queryInterface.removeColumn("Schedules", "queueId");
    }
};
