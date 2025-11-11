"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: (queryInterface) => {
        return queryInterface.removeConstraint("QueueOptions", "QueueOptions_forwardQueueId_fkey");
    },
    down: (queryInterface) => {
        return queryInterface.addConstraint("QueueOptions", {
            fields: ["forwardQueueId"],
            type: "foreign key",
            name: "QueueOptions_forwardQueueId_fkey",
            references: {
                table: "Queues",
                field: "id"
            },
            onUpdate: "NO ACTION",
            onDelete: "NO ACTION"
        });
    }
};
