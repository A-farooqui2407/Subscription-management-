import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/Toast';
import { dashboardApi } from '../api/dashboard';
import { contactsApi } from '../api/contacts';
import Spinner from '../components/Spinner';
import { Filter, RotateCcw, PieChart, Receipt, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [contactsDict, setContactsDict] = useState({});
  const [contactsList, setContactsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [customerId, setCustomerId] = useState('');

  const [summary, setSummary] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueCount: 0,
  });
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });

  useEffect(() => {
    let alive = true;

    const defaultSummary = {
      totalInvoices: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueCount: 0,
    };

    (async () => {
      setLoading(true);
      try {
        const rep = await dashboardApi.getReports({ limit: 50, page: 1 });
        if (!alive) return;
        setSummary(rep.summary ?? defaultSummary);
        setFilteredInvoices(rep.invoices || []);
        setPagination(rep.pagination || { page: 1, limit: 50, total: 0 });
      } catch (e) {
        if (!alive) return;
        const msg =
          e.response?.data?.message ||
          e.message ||
          'Could not load report data.';
        toast.error(msg);
      } finally {
        try {
          const { rows } = await contactsApi.getContacts({ limit: 100, page: 1 });
          if (!alive) return;
          setContactsList(rows);
          const cDict = {};
          rows.forEach((c) => {
            cDict[c.id] = c.name;
          });
          setContactsDict(cDict);
        } catch {
          if (!alive) return;
          setContactsList([]);
          setContactsDict({});
        }
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const applyFilters = useCallback(async () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      toast.warning('Both start and end dates are required when filtering by date.');
      return;
    }
    setLoading(true);
    try {
      const params = { limit: 50, page: 1 };
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      if (status) params.status = status;
      if (customerId) params.customerId = customerId;
      const rep = await dashboardApi.getReports(params);
      setSummary(rep.summary);
      setFilteredInvoices(rep.invoices || []);
      setPagination(rep.pagination || { page: 1, limit: 50, total: 0 });
      toast.success('Filters applied.');
    } catch (e) {
      toast.error(e.message || 'Reports pipeline failed');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, status, customerId]);

  const resetFilters = useCallback(async () => {
    setStartDate('');
    setEndDate('');
    setStatus('');
    setCustomerId('');
    setLoading(true);
    try {
      const rep = await dashboardApi.getReports({ limit: 50, page: 1 });
      setSummary(rep.summary);
      setFilteredInvoices(rep.invoices || []);
      setPagination(rep.pagination || { page: 1, limit: 50, total: 0 });
    } catch (e) {
      toast.error('Failed to reset report view');
    } finally {
      setLoading(false);
    }
  }, []);

  const totals = filteredInvoices.reduce(
    (acc, inv) => {
      acc.subtotal += Number(inv.subtotal || 0);
      acc.tax += Number(inv.tax ?? inv.taxTotal ?? 0);
      acc.total += Number(inv.total || 0);
      return acc;
    },
    { subtotal: 0, tax: 0, total: 0 }
  );

  const customerLabel = (inv) =>
    inv.subscription?.customer?.name || contactsDict[inv.subscription?.customerId] || 'Client Unknown';

  const issueLabel = (inv) =>
    inv.issueDate || (inv.createdAt && String(inv.createdAt).slice(0, 10)) || '—';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Revenue Matrix Analytics</h1>
          <p className="mt-1 text-slate-500">Filter, extract, and dissect deep invoice hooks aggregating financial histories.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 tracking-widest uppercase mb-1">
          <Filter className="w-4 h-4 text-slate-400" /> Filter Criteria Configuration
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Starting Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Ending Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Invoice State</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm appearance-none font-medium text-slate-700"
            >
              <option value="">Any State Layer</option>
              <option value="draft">Draft Forms</option>
              <option value="confirmed">Confirmed Validities</option>
              <option value="paid">Settled / Paid in Full</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Target Client</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm appearance-none font-medium text-slate-700"
            >
              <option value="">Specific Targets (All)</option>
              {contactsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={resetFilters}
            className="py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Reset Filters
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm text-sm"
          >
            Execute Pipeline Check
          </button>
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl shadow-sm text-center relative overflow-hidden">
            <Receipt className="absolute -left-4 top-1/2 -translate-y-1/2 w-32 h-32 text-indigo-500/10 pointer-events-none" />
            <p className="text-sm font-bold tracking-widest uppercase text-indigo-800">Matching Invoices</p>
            <h2 className="text-4xl font-black text-indigo-600 mt-2 tracking-tighter">{summary.totalInvoices}</h2>
            <p className="text-xs text-indigo-600/70 mt-1">Page {pagination.page} · {filteredInvoices.length} rows</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl shadow-sm text-center relative overflow-hidden">
            <PieChart className="absolute -left-4 top-1/2 -translate-y-1/2 w-32 h-32 text-blue-500/10 pointer-events-none" />
            <p className="text-sm font-bold tracking-widest uppercase text-blue-800">Assessed Gross Revenue</p>
            <h2 className="text-4xl font-black text-blue-600 mt-2 tracking-tighter font-mono">
              ${Number(summary.totalAmount || 0).toFixed(2)}
            </h2>
          </div>

          <div className="bg-green-50 border border-green-100 p-6 rounded-3xl shadow-sm text-center relative overflow-hidden">
            <Calendar className="absolute -left-4 top-1/2 -translate-y-1/2 w-32 h-32 text-green-500/10 pointer-events-none" />
            <p className="text-sm font-bold tracking-widest uppercase text-green-800">Total Liquid Cleared</p>
            <h2 className="text-4xl font-black text-green-600 mt-2 tracking-tighter font-mono">
              ${Number(summary.paidAmount || 0).toFixed(2)}
            </h2>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" color="indigo" />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <th className="p-4 pl-6">Invoice Root</th>
                  <th className="p-4">Entity Ref</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4 text-center">Lifecycle Status</th>
                  <th className="p-4 text-right">Computed Subtotal</th>
                  <th className="p-4 text-right">Applied Tax</th>
                  <th className="p-4 pr-6 text-right">Final Logic Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/50 cursor-pointer"
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                  >
                    <td className="p-4 pl-6 font-bold text-indigo-600 text-sm whitespace-nowrap hover:underline">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-700">{customerLabel(inv)}</td>
                    <td className="p-4 text-sm text-slate-500">{issueLabel(inv)}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border
                                  ${
                                    inv.status === 'paid'
                                      ? 'bg-green-100 text-green-700 border-green-200'
                                      : inv.status === 'confirmed'
                                        ? 'bg-orange-100 text-orange-700 border-orange-200'
                                        : inv.status === 'cancelled'
                                          ? 'bg-red-100 text-red-700 border-red-200'
                                          : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }
                               `}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm font-medium font-mono text-slate-600">
                      ${Number(inv.subtotal || 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-right text-sm font-medium font-mono text-slate-500">
                      ${Number(inv.tax ?? inv.taxTotal ?? 0).toFixed(2)}
                    </td>
                    <td className="p-4 pr-6 text-right text-sm font-black font-mono text-slate-900">
                      ${Number(inv.total || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-slate-400 font-medium">
                      Zero matching logic states executed against parameters natively.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/80 border-t-2 border-slate-200 text-sm font-black">
                  <td colSpan="4" className="p-4 pl-6 text-right uppercase tracking-widest text-slate-600">
                    Page totals (visible rows)
                  </td>
                  <td className="p-4 text-right font-mono text-indigo-700">${totals.subtotal.toFixed(2)}</td>
                  <td className="p-4 text-right font-mono text-indigo-700">${totals.tax.toFixed(2)}</td>
                  <td className="p-4 pr-6 text-right font-mono text-blue-700 tracking-tighter text-lg">
                    ${totals.total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
