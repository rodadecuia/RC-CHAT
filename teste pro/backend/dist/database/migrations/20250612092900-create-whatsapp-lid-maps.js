"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.createTable("WhatsappLidMaps", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            lid: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            companyId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            contactId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Contacts",
                    key: "id"
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
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
        await queryInterface.addIndex("WhatsappLidMaps", ["lid"]);
        await queryInterface.addIndex("WhatsappLidMaps", ["companyId"]);
        await queryInterface.addConstraint("WhatsappLidMaps", {
            fields: ["lid", "companyId"],
            type: "unique",
            name: "unique_lid_companyId"
        });
    },
    down: async (queryInterface) => {
        return queryInterface.dropTable("WhatsappLidMaps");
    }
};
