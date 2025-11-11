"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: async (queryInterface) => {
        return queryInterface.addIndex("BaileysKeys", ["whatsappId", "type", "key"], {
            name: "idx_baileyskeys_whatsappid_type_key"
        });
    },
    down: async (queryInterface) => {
        return queryInterface.removeIndex("BaileysKeys", "idx_baileyskeys_whatsappid_type_key");
    }
};
