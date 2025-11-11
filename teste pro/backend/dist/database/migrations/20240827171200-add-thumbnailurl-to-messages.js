"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: (queryInterface) => {
        return Promise.all([
            queryInterface.addColumn("Messages", "thumbnailUrl", {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            })
        ]);
    },
    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("Messages", "thumbnailUrl")
        ]);
    }
};
