'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('plans', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      name: { type: Sequelize.STRING, allowNull: false },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      billing_period: {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'yearly'),
        allowNull: false,
      },
      min_qty: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      start_date: { type: Sequelize.DATEONLY, allowNull: true },
      end_date: { type: Sequelize.DATEONLY, allowNull: true },
      auto_close: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      closable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      pausable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      renewable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('plans');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_plans_billing_period";');
  },
};
