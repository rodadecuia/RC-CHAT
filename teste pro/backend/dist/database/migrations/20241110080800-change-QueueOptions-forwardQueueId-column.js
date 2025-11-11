"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.changeColumn("QueueOptions", "forwardQueueId", {
            type: sequelize_1.DataTypes.INTEGER,
            references: { model: "Queues", key: "id" },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
            allowNull: true
        });
    },
    down: async (queryInterface) => {
        await queryInterface.changeColumn("QueueOptions", "forwardQueueId", {
            type: sequelize_1.DataTypes.INTEGER,
            references: { model: "Queues", key: "id" },
            allowNull: true
        });
    }
};
