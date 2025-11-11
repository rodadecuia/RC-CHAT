"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.removeConstraint("Contacts", "number_companyid_unique");
    },
    down: async (queryInterface) => {
        await queryInterface.addConstraint("Contacts", { fields: ["number", "companyId"],
            type: "unique",
            name: "number_companyid_unique"
        });
    }
};
