"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        return queryInterface.addColumn("Users", "hideAdminUI", {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
    },
    down: async (queryInterface) => {
        return queryInterface.removeColumn("Users", "hideAdminUI");
    }
};
