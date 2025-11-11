"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        return queryInterface.createTable("QuickPix", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            companyId: {
                type: sequelize_1.DataTypes.INTEGER,
                references: {
                    model: "Companies",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false
            },
            key: {
                type: sequelize_1.DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            pixcode: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false
            },
            expiration: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            isPaid: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            metadata: {
                type: sequelize_1.DataTypes.JSONB,
                allowNull: true
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            }
        });
    },
    down: async (queryInterface) => {
        return queryInterface.dropTable("QuickPix");
    }
};
