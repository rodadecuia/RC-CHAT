"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return Promise.all([
            queryInterface.addColumn("Whatsapps", "restrictToQueues", {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false
            }),
            queryInterface.addColumn("Whatsapps", "transferToNewTicket", {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false
            })
        ]);
    },
    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("Whatsapps", "restrictToQueues"),
            queryInterface.removeColumn("Whatsapps", "transferToNewTicket")
        ]);
    }
};
