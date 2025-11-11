"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Contacts", "profileHiresPictureUrl", {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Contacts", "profileHiresPictureUrl");
    }
};
