"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Whatsapps", "extraParameters", {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            defaultValue: {}
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Whatsapps", "extraParameters");
    }
};
