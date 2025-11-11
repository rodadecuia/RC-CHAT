"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: (queryInterface) => {
        return Promise.all([
            queryInterface.addColumn("QuickMessages", "mediaName", {
                type: sequelize_1.DataTypes.TEXT,
                defaultValue: "",
                allowNull: true
            }),
            queryInterface.addColumn("QuickMessages", "mediaPath", {
                type: sequelize_1.DataTypes.TEXT,
                defaultValue: "",
                allowNull: true
            })
        ]);
    },
    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("QuickMessages", "mediaName"),
            queryInterface.removeColumn("QuickMessages", "mediaPath")
        ]);
    }
};
