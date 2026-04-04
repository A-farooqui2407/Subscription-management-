import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/Toast';
import { discountsApi } from '../api/discounts';
import DiscountModal from '../components/DiscountModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { Percent, Edit2, Trash2, Filter } from 'lucide-react';

const Discounts = () => {
  const toast = useToast();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Params
  const [appliesFilter, setAppliesFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  
  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await discountsApi.getDiscounts({ appliesTo: appliesFilter, isActive: isActiveFilter });
      setData(res);
    } catch (e) {
      toast.error('Failed to load discounts mapping pipeline');
    } finally {
      setLoading(false);
    }
  }, [appliesFilter, isActiveFilter, toast]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  // Handlers
  const handleSave = async (dData) => {
    try {
      if (editingDiscount) {
        await discountsApi.updateDiscount(editingDiscount.id, dData);
        toast.success("Discount criteria updated.");
      } else {
        await discountsApi.createDiscount(dData);
        toast.success("Discount promo minted.");
      }
      setIsModalOpen(false);
      fetchDiscounts();
    } catch (e) {
      toast.error("Failed to compile discount settings.");
    }
  };

  const inlineToggleActive = async (discount, newActiveState) => {
     try {
        await discountsApi.updateDiscount(discount.id, { ...discount, isActive: newActiveState });
        toast.info(`Discount is now ${newActiveState ? 'active' : 'dormant'}.`);
        fetchDiscounts();
     } catch (e) {
        toast.error("Toggle execution failed natively.");
     }
  };

  const confirmDelete = async () => {
    try {
      await discountsApi.deleteDiscount(deleteId);
      toast.success("Discount removed completely.");
      setIsConfirmOpen(false);
      fetchDiscounts();
    } catch (e) {
      toast.error("Deletion rejected syntactically.");
    }
  };

  const openDelete = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const openEdit = (discount) => {
    setEditingDiscount(discount);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingDiscount(null);
    setIsModalOpen(true);
  };

  // Logic evaluations
  const isExpired = (endDate) => {
     if (!endDate) return false;
     return new Date(endDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Promotions</h1>
          <p className="mt-1 text-slate-500">Monitor and calculate discount reductions targeting checkouts dynamically.</p>
        </div>
        <button 
          onClick={openCreate}
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-orange-500/50"
        >
          Add Discount
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <span className="text-sm font-semibold text-slate-600 hidden sm:block">Refine Strategy Scope</span>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select 
            value={appliesFilter}
            onChange={e => setAppliesFilter(e.target.value)}
            className="flex-1 sm:w-48 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 py-2.5 px-3 outline-none"
          >
            <option value="">Targets: All</option>
            <option value="Subscriptions">Subscriptions Only</option>
            <option value="Products">Products Only</option>
            <option value="Both">Target Unrestricted</option>
          </select>
          <select 
            value={isActiveFilter}
            onChange={e => setIsActiveFilter(e.target.value)}
            className="flex-1 sm:w-40 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 py-2.5 px-3 outline-none"
          >
            <option value="">Visibility: All</option>
            <option value="true">Active Promotions</option>
            <option value="false">Dormant Variants</option>
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
                title="No Discount Logics Found" 
                description="Adjust filters or construct a new promotional sequence array." 
                icon={Percent} 
             />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  <th className="p-4 pl-6">Promo Details</th>
                  <th className="p-4">Deduction Scope</th>
                  <th className="p-4">Validity Targets</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-right">Configuration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map(d => {
                  const expired = isExpired(d.endDate);
                  const usageCapReached = d.limitUsage ? d.used >= d.limitUsage : false;
                  
                  return (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 pl-6">
                       <div className="flex items-center gap-2">
                           <span className="font-bold text-slate-800">{d.name}</span>
                           {expired && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Expired</span>}
                       </div>
                       <div className="text-xs text-slate-500 font-medium mt-1">
                          Applies implicitly to: <span className="text-orange-600">{d.appliesTo}</span>
                       </div>
                    </td>
                    <td className="p-4">
                        <span className="font-mono text-orange-600 font-extrabold bg-orange-50 px-2 py-1 rounded inline-block">
                           {d.type === 'Percentage' ? `${d.value}% OFF` : `$${d.value.toFixed(2)} OFF`}
                        </span>
                    </td>
                    <td className="p-4">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                            Valid Logic
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                            {d.limitUsage ? (
                               <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${usageCapReached ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                  {d.used} / {d.limitUsage} Uses
                               </span>
                            ) : (
                               <span className="text-xs px-2 py-0.5 rounded-full font-bold border bg-slate-100 text-slate-700 border-slate-200">
                                  ∞ Unlimited uses
                               </span>
                            )}
                        </div>
                    </td>
                    <td className="p-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           checked={d.isActive}
                           onChange={(e) => inlineToggleActive(d, e.target.checked)} 
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                       <button onClick={() => openEdit(d)} className="p-2 text-slate-400 hover:text-orange-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
                          <Edit2 className="w-4 h-4" />
                       </button>
                       <button onClick={() => openDelete(d.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DiscountModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        discountToEdit={editingDiscount} 
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        title="Destroy Discount Ruleset?" 
        message="Dropping this promo invalidates it permanently. Legacy checkouts utilizing it will preserve their mathematical state, but future uses are barred globally."
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default Discounts;
