"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(`
      DELETE FROM "TicketTags"
      WHERE "ctid" IN (
        SELECT "ctid"
        FROM (
          SELECT "ctid",
                 ROW_NUMBER() OVER (PARTITION BY "ticketId", "tagId" ORDER BY "ticketId") AS row_num
          FROM "TicketTags"
        ) subquery
        WHERE subquery.row_num > 1
      );
    `);
        await queryInterface.addConstraint("TicketTags", {
            fields: ["ticketId", "tagId"],
            type: "unique",
            name: "unique_ticket_tag"
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeConstraint("TicketTags", "unique_ticket_tag");
    }
};
