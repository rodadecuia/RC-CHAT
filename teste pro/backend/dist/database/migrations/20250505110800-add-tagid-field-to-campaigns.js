"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.addColumn("Campaigns", "tagId", {
            type: sequelize_1.DataTypes.INTEGER,
            references: {
                model: "Tags",
                key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            allowNull: true
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn("Campaigns", "tagId");
    }
};
