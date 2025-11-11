"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.addColumn("QueueOptions", "forwardQueueId", {
                type: sequelize_1.DataTypes.INTEGER,
                references: { model: "Queues", key: "id" },
                allowNull: true
            }, { transaction });
            await queryInterface.addColumn("QueueOptions", "exitChatbot", {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false
            }, { transaction });
            await transaction.commit();
        }
        catch (err) {
            await transaction.rollback();
            throw err;
        }
    },
    down: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.removeColumn("QueueOptions", "forwardQueueId", {
                transaction
            });
            await queryInterface.removeColumn("QueueOptions", "exitChatbot", {
                transaction
            });
            await transaction.commit();
        }
        catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
