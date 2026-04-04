import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { plansApi } from '../api/plans';
import PlanModal from '../components/PlanModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { Tags, Edit2, Trash2, Filter } from 'lucide-react';

const Plans = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Params
  const [billingPeriodFilter, setBillingPeriodFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  
  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const { rows } = await plansApi.getPlans({ billingPeriod: billingPeriodFilter, isActive: isActiveFilter });
      setData(rows);
    } catch (e) {
      toast.error('Failed to parse active plan schemas');
    } finally {
      setLoading(false);
    }
  }, [billingPeriodFilter, isActiveFilter]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Handlers
  const handleSave = async (pData) => {
    try {
      if (editingPlan) {
        await plansApi.updatePlan(editingPlan.id, pData);
        toast.success("Plan infrastructure metrics updated.");
      } else {
        await plansApi.createPlan(pData);
        toast.success("New Recurring Plan initialized globally.");
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (e) {
      toast.error("Failed to commit architecture modifications.");
    }
  };

  const inlineToggleActive = async (plan, newActiveState) => {
     try {
        await plansApi.updatePlan(plan.id, { ...plan, isActive: newActiveState });
        toast.info(`Registration queue has been toggled to: ${newActiveState ? 'active' : 'suspended'}.`);
        fetchPlans();
     } catch (e) {
        toast.error("Suspension switch native failure.");
     }
  };

  const confirmDelete = async () => {
    try {
      await plansApi.deletePlan(deleteId);
      toast.success("Plan fully deleted mapping natively severed.");
      setIsConfirmOpen(false);
      fetchPlans();
    } catch (e) {
      toast.error("Deletion rejected heavily via synthetics.");
    }
  };

  const openDelete = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const OptionBadge = ({ logic, type }) => {
     if (!logic) return null;
     
     const mappedTypes = {
       'autoClose': { label: 'Auto Expire', colors: 'bg-red-100 text-red-700 border-red-200' },
       'closable': { label: 'Cancelable', colors: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
       'pausable': { label: 'Pausable', colors: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
       'renewable': { label: 'Autopay', colors: 'bg-green-100 text-green-700 border-green-200' },
     };
     
     const ui = mappedTypes[type];
     if (!ui) return null;

     return (
       <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider inline-flex mb-1 mr-1 border ${ui.colors}`}>
          {ui.label}
       </div>
     );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Subscription Schemas</h1>
          <p className="mt-1 text-slate-500">Configure recurring behavioral constraints mapped continuously to Client subscriptions.</p>
        </div>
        {isAdmin && (
        <button 
          onClick={openCreate}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-cyan-500/50"
        >
          Initialize Plan
        </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <span className="text-sm font-semibold text-slate-600 hidden sm:block">Configuration Scopes</span>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select 
            value={billingPeriodFilter}
            onChange={e => setBillingPeriodFilter(e.target.value)}
            className="flex-1 sm:w-48 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 py-2.5 px-3 outline-none"
          >
            <option value="">Cycle Match: All</option>
            <option value="Daily">Daily Rotations</option>
            <option value="Weekly">Weekly Schedules</option>
            <option value="Monthly">Monthly Routines</option>
            <option value="Yearly">Yearly Contracts</option>
          </select>
          <select 
            value={isActiveFilter}
            onChange={e => setIsActiveFilter(e.target.value)}
            className="flex-1 sm:w-40 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 py-2.5 px-3 outline-none"
          >
            <option value="">Reg. Scope: All</option>
            <option value="true">Actively Open</option>
            <option value="false">Registration Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex justify-center items-center p-12">
            <Spinner size="lg" color="slate" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex justify-center items-center py-12">
             <EmptyState 
                title="Zero Internal Schemas Resolved" 
                description="Modify search parameters or boot your very first architectural mapping mechanism out." 
                icon={Tags} 
             />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 pb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  <th className="p-4 pl-6">Core Pipeline Description</th>
                  <th className="p-4">Billing Execution Array</th>
                  <th className="p-4">Conditional Constraints</th>
                  <th className="p-4 text-center">Registrations</th>
                  <th className="p-4 text-center">Checkout Toggle</th>
                  <th className="p-4 pr-6 text-right">Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {data.map(p => {
                  return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                       <span className="font-bold text-slate-800 tracking-tight text-sm whitespace-nowrap">{p.name}</span>
                       <div className="font-mono text-cyan-600 font-bold bg-cyan-50 px-2 py-0.5 rounded text-xs mt-1.5 inline-block">
                           ${Number(p.price).toFixed(2)} / {p.billingPeriod.toLowerCase().replace('ly', '')}
                       </div>
                    </td>
                    <td className="p-4">
                       <div className="text-xs text-slate-600 font-medium">
                          Cycle constraint maps: <span className="font-bold text-slate-900">{p.billingPeriod}</span>
                       </div>
                    </td>
                    <td className="p-4 min-w-[200px]">
                       <div className="flex flex-wrap items-center">
                          <OptionBadge logic={p.options?.autoClose} type="autoClose" />
                          <OptionBadge logic={p.options?.closable} type="closable" />
                          <OptionBadge logic={p.options?.pausable} type="pausable" />
                          <OptionBadge logic={p.options?.renewable} type="renewable" />
                       </div>
                    </td>
                    <td className="p-4 text-center">
                       <span className={`text-xs px-2.5 py-1 rounded-full font-bold border 
                          ${p.subscriptionsCount > 0 ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {p.subscriptionsCount} Subs
                       </span>
                    </td>
                    <td className="p-4 text-center">
                      <label className={`relative inline-flex items-center ${isAdmin ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                        <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           disabled={!isAdmin}
                           checked={p.isActive}
                           onChange={(e) => inlineToggleActive(p, e.target.checked)} 
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2 whitespace-nowrap">
                       {isAdmin ? (
                         <>
                           <button type="button" onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-cyan-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
                              <Edit2 className="w-4 h-4" />
                           </button>
                           <button type="button" onClick={() => openDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
                              <Trash2 className="w-4 h-4" />
                           </button>
                         </>
                       ) : (
                         <span className="text-xs text-slate-400">View only</span>
                       )}
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        planToEdit={editingPlan} 
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        title="Wipe Configuration Schema completely?" 
        message="Running this purge invalidates native plan allocations. Ensure you migrated subscriptions safely prior to logic dropout mappings!"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default Plans;
