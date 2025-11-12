import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Plans", "whmcsProductId", {
      type: DataTypes.INTEGER,
      allowNull: true, // Permite nulo para planos que não são do WHMCS
      defaultValue: null
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Plans", "whmcsProductId");
  }
};
