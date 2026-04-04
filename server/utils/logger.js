/**
 * Minimal logger for Sequelize SQL debug (see config/db.js).
 */
module.exports = {
  debug(msg) {
    // eslint-disable-next-line no-console
    console.debug(msg);
  },
};
