import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { subscriptionsApi } from '../api/subscriptions';
import { contactsApi } from '../api/contacts';
import { plansApi } from '../api/plans';
import SubscriptionForm from '../components/SubscriptionForm';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { Repeat, Filter, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Subscriptions = () => {
  const { canWrite } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [data, setData] = useState([]);
  const [contactsDict, setContactsDict] = useState({});
  const [plansDict, setPlansDict] = useState({});
  const [contactsList, setContactsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Params
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, cRes, pRes] = await Promise.all([
        subscriptionsApi.getSubscriptions({ status: statusFilter, customerId: customerFilter }),
        contactsApi.getContacts({ limit: 100, page: 1 }),
        plansApi.getPlans({ limit: 100, page: 1 }),
      ]);
      setData(sRes.rows);

      const cDict = {};
      cRes.rows.forEach((c) => {
        cDict[c.id] = c.name;
      });
      setContactsDict(cDict);
      setContactsList(cRes.rows);

      const pDict = {};
      pRes.rows.forEach((p) => {
        pDict[p.id] = p.name;
      });
      setPlansDict(pDict);
    } catch (e) {
      toast.error('Failed to parse core subscription arrays');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, customerFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (sData) => {
    const { status: intendedStatus, ...createPayload } = sData;
    try {
      const created = await subscriptionsApi.createSubscription(createPayload);
      const id = created?.id;

      if (intendedStatus === 'quotation' && id) {
        try {
          await subscriptionsApi.updateStatus(id, 'quotation');
        } catch (e2) {
          const hint =
            e2.response?.data?.message ||
            e2.message ||
            'Status update failed';
          toast.warning(`Subscription created as draft. ${hint}`);
          setIsModalOpen(false);
          fetchData();
          return;
        }
      }

      toast.success(
        intendedStatus === 'draft'
          ? 'Subscription saved as draft.'
          : 'Quotation issued.',
      );
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.message ||
        'Could not create subscription.';
      toast.error(msg);
    }
  };

  const handleRowClick = (id) => {
      navigate(`/subscriptions/${id}`);
  };

  const StatusBadge = ({ status }) => {
     const statusMaps = {
         draft: 'bg-slate-100 text-slate-700 border-slate-200',
         quotation: 'bg-blue-100 text-blue-700 border-blue-200',
         confirmed: 'bg-orange-100 text-orange-700 border-orange-200',
         active: 'bg-green-100 text-green-700 border-green-200 shadow-[0_0_10px_theme(colors.green.200)]',
         closed: 'bg-red-100 text-red-700 border-red-200'
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Subscriptions Core</h1>
          <p className="mt-1 text-slate-500">Monitor native customer lifetimes tracking quotas inherently via mapped rulesets.</p>
        </div>
        {canWrite && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500/50"
        >
          Draft Subscription
        </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <span className="text-sm font-semibold text-slate-600 hidden sm:block">View Modifiers</span>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select 
            value={customerFilter}
            onChange={e => setCustomerFilter(e.target.value)}
            className="flex-1 sm:w-48 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-2.5 px-3 outline-none"
          >
            <option value="">Clients: ALL</option>
            {contactsList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="flex-1 sm:w-40 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-2.5 px-3 outline-none"
          >
            <option value="">Lifecycle: ALL</option>
            <option value="draft">Draft Blocks</option>
            <option value="quotation">Quotations Issued</option>
            <option value="confirmed">Confirmed Signatures</option>
            <option value="active">Active Billable</option>
            <option value="closed">Closed / Frozen</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex justify-center items-center p-12">
            <Spinner size="lg" color="indigo" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex justify-center items-center py-12">
             <EmptyState 
                title="Zero Subscriptions Detected" 
                description="Unable to locate matching schemas. Change filtering rules natively or create a draft." 
                icon={Repeat} 
             />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 pb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  <th className="p-4 pl-6">Subscription ID</th>
                  <th className="p-4">Customer Entity</th>
                  <th className="p-4">Root Schema Mapping</th>
                  <th className="p-4 text-center">Lifecycle Scope</th>
                  <th className="p-4 text-right">Value Config</th>
                  <th className="p-4 text-center">Engine Status</th>
                  <th className="p-4 pr-6 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {data.map(s => {
                  return (
                  <tr key={s.id} onClick={() => handleRowClick(s.id)} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="p-4 pl-6">
                       <span className="font-extrabold text-slate-800 text-sm whitespace-nowrap tracking-tight">{s.subscriptionNumber}</span>
                    </td>
                    <td className="p-4">
                       <div className="font-bold text-indigo-700 text-sm">{contactsDict[s.customerId] || 'Client Unknown'}</div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600">
                       {s.planId ? plansDict[s.planId] : 'Custom SOW'}
                    </td>
                    <td className="p-4 text-center">
                       <div className="text-[10px] font-bold text-slate-500 uppercase">Starts</div>
                       <div className="text-xs font-medium text-slate-800">{s.startDate.split('T')[0]}</div>
                       {s.expirationDate && (
                           <>
                             <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Expires</div>
                             <div className="text-xs font-medium text-slate-800">{s.expirationDate.split('T')[0]}</div>
                           </>
                       )}
                    </td>
                    <td className="p-4 text-right">
                       <span className="font-mono text-slate-800 font-extrabold">${(s.total || 0).toFixed(2)}</span>
                    </td>
                    <td className="p-4 text-center">
                        <StatusBadge status={s.status} />
                    </td>
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                       <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-indigo-600 transition-colors" />
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SubscriptionForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
      />

    </div>
  );
};

export default Subscriptions;
