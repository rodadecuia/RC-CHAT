"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Contacts", "disableBot", {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Contacts", "disableBot");
    }
};
