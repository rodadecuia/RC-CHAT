"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.addIndex("Users", {
            fields: [
                queryInterface.sequelize.fn("LOWER", queryInterface.sequelize.col("email"))
            ],
            name: "idx_lower_email"
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeIndex("Users", "idx_lower_email");
    }
};
