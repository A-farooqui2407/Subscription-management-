'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscriptions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      subscription_number: { type: Sequelize.STRING, allowNull: false, unique: true },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'contacts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      plan_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'plans', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      discount_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'discounts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      expiration_date: { type: Sequelize.DATEONLY, allowNull: true },
      payment_terms: { type: Sequelize.STRING, allowNull: true },
      status: {
        type: Sequelize.ENUM('draft', 'quotation', 'confirmed', 'active', 'closed'),
        allowNull: false,
        defaultValue: 'draft',
      },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      discount_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      tax_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
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
    await queryInterface.addIndex('subscriptions', ['status'], { name: 'subscriptions_status' });
    await queryInterface.addIndex('subscriptions', ['customer_id'], { name: 'subscriptions_customer_id' });
    await queryInterface.addIndex('subscriptions', ['plan_id'], { name: 'subscriptions_plan_id' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('subscriptions');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_subscriptions_status";');
  },
};
