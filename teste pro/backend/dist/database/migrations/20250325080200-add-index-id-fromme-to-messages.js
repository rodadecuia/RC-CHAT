"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: async (queryInterface) => {
        return queryInterface.addIndex("Messages", ["id", "fromMe"], {
            name: "idx_messages_id_fromme"
        });
    },
    down: async (queryInterface) => {
        return queryInterface.removeIndex("Messages", "idx_messages_id_fromme");
    }
};
