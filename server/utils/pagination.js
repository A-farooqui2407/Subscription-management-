/**
 * Shared list pagination from query string.
 */
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 10);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

module.exports = { parsePagination };
