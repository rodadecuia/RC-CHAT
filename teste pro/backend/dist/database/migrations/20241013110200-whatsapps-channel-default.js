"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        return queryInterface.changeColumn("Whatsapps", "channel", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: "whatsapp"
        });
    },
    down: async (queryInterface) => {
        return queryInterface.changeColumn("Whatsapps", "channel", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        });
    }
};
