"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Queues", "whatsappId", {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
            references: {
                model: "Whatsapps",
                key: "id"
            }
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Queues", "whatsappId");
    }
};
