"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: (queryInterface) => {
        return Promise.all([
            queryInterface.addIndex("Messages", ["createdAt"], {
                name: "idx_messages_createdat"
            }),
            queryInterface.addIndex("Messages", ["updatedAt"], {
                name: "idx_messages_updatedat"
            })
        ]);
    },
    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeIndex("Messages", "idx_messages_createdat"),
            queryInterface.removeIndex("Messages", "idx_messages_updatedat")
        ]);
    }
};
