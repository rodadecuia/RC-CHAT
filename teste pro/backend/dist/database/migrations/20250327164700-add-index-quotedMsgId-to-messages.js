"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: (queryInterface) => {
        return queryInterface.addIndex("Messages", ["ticketId", "quotedMsgId"], {
            name: "idx_messages_ticketid_quotedmsgid"
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeIndex("Messages", "idx_messages_ticketid_quotedmsgid");
    }
};
