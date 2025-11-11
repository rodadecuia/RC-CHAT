"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.removeColumn("Users", "online");
    },
    down: async (queryInterface) => {
        await queryInterface.addColumn("Users", "online", {
            type: "BOOLEAN",
            allowNull: true
        });
    }
};
