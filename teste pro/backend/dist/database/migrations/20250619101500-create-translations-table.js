"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.createTable("Translations", {
            language: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            namespace: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            key: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            value: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false
            }
        });
        // Composite primary index
        await queryInterface.addIndex("Translations", ["language", "namespace", "key"], {
            unique: true,
            name: "composite_language_namespace_key"
        });
        // Additional indexes for individual fields
        await queryInterface.addIndex("Translations", ["language"], {
            name: "index_language"
        });
        await queryInterface.addIndex("Translations", ["namespace"], {
            name: "index_namespace"
        });
        await queryInterface.addIndex("Translations", ["key"], {
            name: "index_key"
        });
    },
    down: async (queryInterface) => {
        return queryInterface.dropTable("Translations");
    }
};
