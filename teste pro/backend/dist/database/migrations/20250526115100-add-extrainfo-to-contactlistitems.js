"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.addColumn("ContactListItems", "extraInfo", {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn("ContactListItems", "extraInfo");
    }
};
