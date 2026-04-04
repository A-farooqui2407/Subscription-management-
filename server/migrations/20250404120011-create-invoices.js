'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invoices', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      subscription_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'subscriptions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      invoice_number: { type: Sequelize.STRING, allowNull: false, unique: true },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      tax: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('draft', 'confirmed', 'paid', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft',
      },
      due_date: { type: Sequelize.DATEONLY, allowNull: true },
      sent_at: { type: Sequelize.DATE, allowNull: true },
      paid_at: { type: Sequelize.DATE, allowNull: true },
      cancelled_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('invoices', ['status'], { name: 'invoices_status' });
    await queryInterface.addIndex('invoices', ['due_date'], { name: 'invoices_due_date' });
    await queryInterface.addIndex('invoices', ['subscription_id'], { name: 'invoices_subscription_id' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('invoices');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_invoices_status";');
  },
};
