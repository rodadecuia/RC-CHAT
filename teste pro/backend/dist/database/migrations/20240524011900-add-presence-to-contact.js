"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Contacts", "presence", {
            type: sequelize_1.DataTypes.STRING,
            defaultValue: "available"
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Contacts", "presence");
    }
};
