import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Contacts", "whmcsClientId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Contacts", "whmcsClientId");
  }
};
