"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.addColumn("Invoices", "txId", {
                type: sequelize_1.DataTypes.STRING
            }, { transaction });
            await queryInterface.addColumn("Invoices", "payGw", {
                type: sequelize_1.DataTypes.STRING
            }, { transaction });
            await queryInterface.addColumn("Invoices", "payGwData", {
                type: sequelize_1.DataTypes.TEXT
            }, { transaction });
            await queryInterface.addIndex("Invoices", ["txId"], {
                name: "idx_txid",
                unique: false,
                transaction
            });
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
            await queryInterface.removeColumn("Invoices", "txId", { transaction });
            await queryInterface.removeColumn("Invoices", "payGw", { transaction });
            await queryInterface.removeColumn("Invoices", "payGwData", {
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
