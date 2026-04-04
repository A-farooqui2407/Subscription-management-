import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/Toast';
import { paymentsApi } from '../api/payments';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { CreditCard, Filter, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const METHOD_TO_API = {
  '': undefined,
  'Bank Transfer': 'bank_transfer',
  Card: 'card',
  Cash: 'cash',
  UPI: 'upi',
};

const Payments = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [methodFilter, setMethodFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const paymentMethod = METHOD_TO_API[methodFilter];
      const { rows } = await paymentsApi.getPayments(
        paymentMethod ? { paymentMethod } : {}
      );
      setData(rows);
    } catch (e) {
      toast.error('Failed to parse active ledgers natively');
    } finally {
      setLoading(false);
    }
  }, [methodFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRowClick = (invoiceId) => {
    navigate(`/invoices/${invoiceId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payments Log</h1>
          <p className="mt-1 text-slate-500">Trace transactional hooks verifying liquid cash influx logic continuously.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <span className="text-sm font-semibold text-slate-600 hidden sm:block">Ledger Gateway Traps</span>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="flex-1 sm:w-48 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 py-2.5 px-3 outline-none"
          >
            <option value="">Methods: ALL</option>
            <option value="Bank Transfer">Bank Transfer (Wires)</option>
            <option value="Card">Cards via Gateway</option>
            <option value="Cash">Cash / Physical</option>
            <option value="UPI">UPI Logic (Standardized)</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex justify-center items-center p-12">
            <Spinner size="lg" color="emerald" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex justify-center items-center py-12">
            <EmptyState
              title="Zero Ledger Footprints Found"
              description="Unable to locate matching transactions. Payments appear here automatically upon invoice deduction clearance."
              icon={CreditCard}
            />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 pb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  <th className="p-4 pl-6">Reference Block</th>
                  <th className="p-4">Customer Entity</th>
                  <th className="p-4">Assigned Invoice Hook</th>
                  <th className="p-4 text-center">Action System</th>
                  <th className="p-4 text-right">Extracted Total</th>
                  <th className="p-4 text-center">Date Confirmed</th>
                  <th className="p-4 pr-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {data.map((p) => {
                  const customerName = p.invoice?.subscription?.customer?.name || 'Client Unknown';
                  const invNo = p.invoice?.invoiceNumber || `INV-Reference-${p.invoiceId}`;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleRowClick(p.invoiceId)}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="p-4 pl-6">
                        <span className="font-extrabold text-slate-800 text-sm whitespace-nowrap tracking-tight">
                          PAY-{String(p.id).slice(0, 8)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-700 text-sm">{customerName}</div>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-emerald-600 transition-colors">
                        {invNo}
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-tight">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono text-emerald-600 font-black tracking-tight text-base">
                          ${(Number(p.amount) || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-center font-medium text-sm text-slate-600">{p.paymentDate}</td>
                      <td className="p-4 pr-6 text-right whitespace-nowrap">
                        <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-emerald-600 transition-colors" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
