import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tickets", "whmcsTicketId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tickets", "whmcsTicketId");
  }
};
