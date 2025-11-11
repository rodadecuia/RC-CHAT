"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: (queryInterface) => {
        return Promise.all([
            queryInterface.addIndex("TicketTraking", ["createdAt"], {
                name: "idx_tickettraking_createdat"
            }),
            queryInterface.addIndex("TicketTraking", ["updatedAt"], {
                name: "idx_tickettraking_updatedat"
            })
        ]);
    },
    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeIndex("TicketTraking", "idx_tickettraking_createdat"),
            queryInterface.removeIndex("TicketTraking", "idx_tickettraking_updatedat")
        ]);
    }
};
