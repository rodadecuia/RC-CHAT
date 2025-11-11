'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Plans', 'whmcsProductId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Plans', 'whmcsProductId');
  }
};
