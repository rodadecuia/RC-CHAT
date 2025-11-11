"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.addColumn("Contacts", "language", {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            }, { transaction });
            await queryInterface.addColumn("Whatsapps", "language", {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            }, { transaction });
            await queryInterface.addColumn("Companies", "language", {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            }, { transaction });
            await transaction.commit();
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
    down: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.removeColumn("Contacts", "language", {
                transaction
            });
            await queryInterface.removeColumn("Whatsapps", "language", {
                transaction
            });
            await queryInterface.removeColumn("Companies", "language", {
                transaction
            });
            await transaction.commit();
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
