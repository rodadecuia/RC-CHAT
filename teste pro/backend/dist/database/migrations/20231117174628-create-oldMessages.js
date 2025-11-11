"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.createTable("OldMessages", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            messageId: {
                type: sequelize_1.DataTypes.STRING,
                references: { model: "Messages", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false
            },
            body: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false
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
    },
    down: (queryInterface) => {
        return queryInterface.dropTable("OldMessages");
    }
};
