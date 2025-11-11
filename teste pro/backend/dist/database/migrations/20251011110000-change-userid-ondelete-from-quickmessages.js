"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(queryInterface) {
    await queryInterface.removeConstraint("QuickMessages", "QuickMessages_userId_fkey");
    await queryInterface.addConstraint("QuickMessages", {
        fields: ["userId"],
        type: "foreign key",
        name: "QuickMessages_userId_fkey",
        references: {
            table: "Users",
            field: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
    });
}
async function down(queryInterface) {
    await queryInterface.removeConstraint("QuickMessages", "QuickMessages_userId_fkey");
    await queryInterface.addConstraint("QuickMessages", {
        fields: ["userId"],
        type: "foreign key",
        name: "QuickMessages_userId_fkey",
        references: {
            table: "Users",
            field: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    });
}
