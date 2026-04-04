import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/Toast';
import { invoicesApi } from '../api/invoices';
import { contactsApi } from '../api/contacts';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { Receipt, Filter, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Invoices = () => {
  const toast = useToast();
  const navigate = useNavigate();
  
  const [data, setData] = useState([]);
  const [contactsDict, setContactsDict] = useState({});
  const [loading, setLoading] = useState(true);

  // Params
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [iRes, cRes] = await Promise.all([
        invoicesApi.getInvoices({ status: statusFilter }),
        contactsApi.getContacts({ limit: 100, page: 1 }),
      ]);
      setData(iRes.rows);

      const cDict = {};
      cRes.rows.forEach((c) => {
        cDict[c.id] = c.name;
      });
      setContactsDict(cDict);
    } catch (e) {
      toast.error('Failed to parse invoices natively');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRowClick = (id) => {
      navigate(`/invoices/${id}`);
  };
  
  const isOverdue = (invoice) => {
      if (invoice.status === 'paid' || invoice.status === 'draft') return false;
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      return dueDate < today;
  };

  const StatusBadge = ({ status }) => {
     const statusMaps = {
         draft: 'bg-slate-100 text-slate-700 border-slate-200',
         confirmed: 'bg-orange-100 text-orange-700 border-orange-200',
         paid: 'bg-green-100 text-green-700 border-green-200 shadow-[0_0_10px_theme(colors.green.200)]',
         cancelled: 'bg-red-100 text-red-700 border-red-200'
     };
     const css = statusMaps[status?.toLowerCase()] || statusMaps.draft;
     return (
         <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${css}`}>
             {status}
         </span>
     );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Invoice Ledgers</h1>
          <p className="mt-1 text-slate-500">Monitor native B2B invoices natively generating cash flows systematically.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <span className="text-sm font-semibold text-slate-600 hidden sm:block">Ledger Optics</span>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />

          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="flex-1 sm:w-48 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 py-2.5 px-3 outline-none"
          >
            <option value="">Status: ALL</option>
            <option value="draft">Review Drafts</option>
            <option value="confirmed">Confirmed Signatures</option>
            <option value="paid">Fully Settled</option>
            <option value="cancelled">Cancelled Vectors</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex justify-center items-center p-12">
            <Spinner size="lg" color="red" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex justify-center items-center py-12">
             <EmptyState 
                title="Zero Invoices Initialized" 
                description="Unable to locate matching schemas. Change filtering rules natively or create a draft subscription to invoice out." 
                icon={Receipt} 
             />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 pb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  <th className="p-4 pl-6">Invoice Root</th>
                  <th className="p-4">Customer Entity</th>
                  <th className="p-4">Sub Ref Number</th>
                  <th className="p-4 text-right">Invoice Config Total</th>
                  <th className="p-4 text-center">Due Configuration</th>
                  <th className="p-4 text-center">Status Flag</th>
                  <th className="p-4 pr-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {data.map(inv => {
                  const overdue = isOverdue(inv);
                  return (
                  <tr key={inv.id} onClick={() => handleRowClick(inv.id)} className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${overdue ? 'bg-red-50/20' : ''}`}>
                    <td className="p-4 pl-6">
                       <span className="font-extrabold text-slate-800 text-sm whitespace-nowrap tracking-tight">{inv.invoiceNumber}</span>
                       <div className="text-xs text-slate-500 mt-1 font-medium">Issued: {inv.issueDate}</div>
                    </td>
                    <td className="p-4">
                       <div className="font-bold text-slate-700 text-sm">{inv.subscription?.customer?.name || contactsDict[inv.subscription?.customerId] || 'Client Voided'}</div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-400">
                       {inv.subscriptionId ? `SUB-...${inv.subscriptionId}` : 'Ad-hoc (Direct)'}
                    </td>
                    <td className="p-4 text-right">
                       <span className="font-mono text-slate-800 font-black">${(inv.total || 0).toFixed(2)}</span>
                       {inv.amountPaid > 0 && inv.status !== 'paid' && (
                           <div className="text-[10px] text-green-600 font-bold mt-1 uppercase tracking-widest">
                               Partial: ${inv.amountPaid.toFixed(2)}
                           </div>
                       )}
                    </td>
                    <td className="p-4 text-center">
                       <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 ${overdue ? 'bg-red-100 text-red-700' : 'text-slate-500 bg-slate-100'}`}>
                           {overdue && <AlertCircle className="w-3.5 h-3.5" />}
                           {inv.dueDate}
                       </div>
                    </td>
                    <td className="p-4 text-center">
                        <StatusBadge status={inv.status} />
                    </td>
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                       <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-red-600 transition-colors" />
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Invoices;
