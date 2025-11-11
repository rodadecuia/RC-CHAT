"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: (queryInterface) => {
        return Promise.all([
            queryInterface.addIndex("Tickets", ["createdAt"], {
                name: "idx_tickets_createdat"
            }),
            queryInterface.addIndex("Tickets", ["updatedAt"], {
                name: "idx_tickets_updatedat"
            })
        ]);
    },
    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeIndex("Tickets", "idx_tickets_createdat"),
            queryInterface.removeIndex("Tickets", "idx_tickets_updatedat")
        ]);
    }
};
