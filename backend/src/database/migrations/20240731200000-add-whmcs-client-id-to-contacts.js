'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Contacts', 'whmcsClientId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
      // unique: true // Pode ser único se cada contato RC-CHAT for um cliente WHMCS
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Contacts', 'whmcsClientId');
  }
};
