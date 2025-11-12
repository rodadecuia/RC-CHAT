import { QueryInterface, DataTypes, Sequelize } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('Companies');
    if (!tableDefinition.whmcsClientId) {
      await queryInterface.addColumn('Companies', 'whmcsClientId', {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      });
    }
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Companies", "whmcsClientId");
  }
};
