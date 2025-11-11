"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.createTable("OutOfTicketMessages", {
            id: {
                type: sequelize_1.DataTypes.STRING,
                primaryKey: true,
                allowNull: false
            },
            whatsappId: {
                type: sequelize_1.DataTypes.INTEGER,
                references: { model: "Whatsapps", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false
            },
            dataJson: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false
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
        await queryInterface.addIndex("OutOfTicketMessages", ["createdAt"], {
            name: "OutOfTicketMessages_createdAt_index"
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable("OutOfTicketMessages");
    }
};
