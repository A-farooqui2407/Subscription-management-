/**
 * Backend envelope: { success, message, data, meta }.
 * List endpoints use res.paginated → data is rows[], meta has total/page/limit.
 */

export function assertSuccess(body) {
  if (!body || body.success !== true) {
    const msg = body?.message || 'Request failed';
    const err = new Error(msg);
    err.body = body;
    throw err;
  }
}

export function unwrapDataFromResponse(response) {
  const body = response.data;
  assertSuccess(body);
  return body.data;
}

export function unwrapPaginatedResponse(response) {
  const body = response.data;
  assertSuccess(body);
  return {
    rows: Array.isArray(body.data) ? body.data : [],
    meta: body.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
  };
}
