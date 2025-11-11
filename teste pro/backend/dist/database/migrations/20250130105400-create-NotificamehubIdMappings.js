"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.createTable("NotificamehubIdMappings", {
            id: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
                primaryKey: true
            },
            messageId: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            ticketId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Tickets",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE(6),
                allowNull: false
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE(6),
                allowNull: false
            }
        });
        await queryInterface.addConstraint("NotificamehubIdMappings", {
            fields: ["messageId", "ticketId"],
            type: "unique",
            name: "NotificamehubIdMappings_messageId_ticketId_unique"
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable("NotificamehubIdMappings");
    }
};
