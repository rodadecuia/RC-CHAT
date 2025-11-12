'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('Companies');
    if (!tableDefinition.whmcsClientId) {
      await queryInterface.addColumn('Companies', 'whmcsClientId', {
        type: Sequelize.INTEGER,
        allowNull: true, // ou false, dependendo da sua regra de negócio
        defaultValue: null
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Companies', 'whmcsClientId');
  }
};
