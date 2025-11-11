'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Companies', 'whmcsClientId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Companies', 'whmcsClientId');
  }
};
