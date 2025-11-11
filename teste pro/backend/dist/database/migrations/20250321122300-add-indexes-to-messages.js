"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.addIndex("Messages", ["companyId", "contactId"], {
            name: "idx_messages_companyid_contactid"
        });
        await queryInterface.addIndex("Messages", ["ticketId", "companyId"], {
            name: "idx_messages_ticketid_companyid"
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeIndex("Messages", "idx_messages_companyid_contactid");
        await queryInterface.removeIndex("Messages", "idx_messages_ticketid_companyid");
    }
};
