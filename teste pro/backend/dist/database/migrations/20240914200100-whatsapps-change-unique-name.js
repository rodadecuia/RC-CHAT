"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: async (queryInterface) => {
        try {
            await queryInterface.removeConstraint("Whatsapps", "Whatsapps_name_key");
        }
        catch (e) {
            // no operation
        }
        return queryInterface.addConstraint("Whatsapps", {
            fields: ["companyId", "name"],
            type: "unique",
            name: "company_name_constraint"
        });
    },
    down: async (queryInterface) => {
        try {
            await queryInterface.addConstraint("Whatsapps", {
                fields: ["name"],
                type: "unique",
                name: "Whatsapps_name_key"
            });
        }
        catch (e) {
            // no operation
        }
        return queryInterface.removeConstraint("Whatsapps", "company_name_constraint");
    }
};
