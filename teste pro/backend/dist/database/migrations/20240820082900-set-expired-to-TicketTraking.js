"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: (queryInterface) => {
        return queryInterface.bulkUpdate("TicketTraking", { expired: true }, {
            rated: false,
            ratingAt: { [sequelize_1.Op.not]: null }
        });
    },
    down: () => {
        return Promise.resolve(true);
    }
};
