'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Tickets', 'whmcsTicketId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Tickets', 'whmcsTicketId');
  }
};
