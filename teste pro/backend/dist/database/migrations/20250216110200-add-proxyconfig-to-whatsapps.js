"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Whatsapps", "proxyConfig", {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Whatsapps", "proxyConfig");
    }
};
