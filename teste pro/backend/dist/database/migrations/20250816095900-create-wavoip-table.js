"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.createTable("Wavoips", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: sequelize_1.DataTypes.INTEGER
            },
            token: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false
            },
            whatsappId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                unique: true,
                references: {
                    model: "Whatsapps",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            createdAt: {
                allowNull: false,
                type: sequelize_1.DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: sequelize_1.DataTypes.DATE
            }
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable("Wavoips");
    }
};
