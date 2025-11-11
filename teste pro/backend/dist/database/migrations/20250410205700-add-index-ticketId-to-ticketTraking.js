"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: (queryInterface) => {
        return queryInterface.addIndex("TicketTraking", ["ticketId"], {
            name: "idx_tickettraking_ticketid"
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeIndex("TicketTraking", "idx_tickettraking_ticketid");
    }
};
