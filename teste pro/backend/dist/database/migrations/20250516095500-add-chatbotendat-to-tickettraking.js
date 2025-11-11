"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.addColumn("TicketTraking", "chatbotendAt", {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: "Timestamp indicating when the chatbot interaction ended"
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn("TicketTraking", "chatbotendAt");
    }
};
