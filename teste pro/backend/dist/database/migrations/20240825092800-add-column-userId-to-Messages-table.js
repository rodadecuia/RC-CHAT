"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: (queryInterface) => {
        return Promise.all([
            queryInterface.addColumn("Messages", "userId", {
                type: sequelize_1.DataTypes.INTEGER,
                references: { model: "Users", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            }),
            queryInterface.addColumn("OldMessages", "userId", {
                type: sequelize_1.DataTypes.INTEGER,
                references: { model: "Users", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            })
        ]);
    },
    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("Messages", "userId"),
            queryInterface.removeColumn("OldMessages", "userId")
        ]);
    }
};
