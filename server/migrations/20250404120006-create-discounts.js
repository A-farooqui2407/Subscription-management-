'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('discounts', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      name: { type: Sequelize.STRING, allowNull: false },
      type: {
        type: Sequelize.ENUM('fixed', 'percentage'),
        allowNull: false,
      },
      value: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      min_purchase: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      min_qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      limit_usage: { type: Sequelize.INTEGER, allowNull: true },
      used_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      applies_to: {
        type: Sequelize.ENUM('products', 'subscriptions'),
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
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
    await queryInterface.dropTable('discounts');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_discounts_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_discounts_applies_to";');
  },
};
