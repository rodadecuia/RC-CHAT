"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.createTable("ContactTags", {
            contactId: {
                type: sequelize_1.DataTypes.INTEGER,
                references: { model: "Contacts", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false
            },
            tagId: {
                type: sequelize_1.DataTypes.INTEGER,
                references: { model: "Tags", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            }
        });
        await queryInterface.addConstraint("ContactTags", {
            fields: ["contactId", "tagId"],
            type: "unique",
            name: "unique_contact_tag"
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable("ContactTags");
    }
};
