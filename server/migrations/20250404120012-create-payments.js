'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      invoice_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'invoices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      payment_method: {
        type: Sequelize.ENUM('cash', 'card', 'bank_transfer', 'upi', 'check', 'other'),
        allowNull: false,
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      payment_date: { type: Sequelize.DATEONLY, allowNull: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addIndex('payments', ['payment_date'], { name: 'payments_payment_date' });
    await queryInterface.addIndex('payments', ['invoice_id'], { name: 'payments_invoice_id' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_payment_method";');
  },
};
