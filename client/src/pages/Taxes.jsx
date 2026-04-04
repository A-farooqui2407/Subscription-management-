import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { taxesApi } from '../api/taxes';
import TaxModal from '../components/TaxModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { Receipt, Edit2, Trash2, Filter } from 'lucide-react';

const Taxes = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Params
  const [isActiveFilter, setIsActiveFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  
  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchTaxes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taxesApi.getTaxes({ isActive: isActiveFilter });
      setData(Array.isArray(res) ? res : []);
    } catch (e) {
      toast.error('Failed to load tax mappings');
    } finally {
      setLoading(false);
    }
  }, [isActiveFilter]);

  useEffect(() => {
    fetchTaxes();
  }, [fetchTaxes]);

  // Handlers
  const handleSave = async (taxData) => {
    try {
      if (editingTax) {
        await taxesApi.updateTax(editingTax.id, taxData);
        toast.success("Tax updated globally");
      } else {
        await taxesApi.createTax(taxData);
        toast.success("Tax injected into routing system");
      }
      setIsModalOpen(false);
      fetchTaxes();
    } catch (e) {
      toast.error("An error occurred committing your tax laws");
    }
  };

  const inlineToggleActive = async (tax, newActiveState) => {
     try {
        await taxesApi.updateTax(tax.id, { ...tax, isActive: newActiveState });
        toast.info(`Tax configuration has been ${newActiveState ? 'activated' : 'deactivated'}.`);
        fetchTaxes();
     } catch (e) {
        toast.error("Failed to swap tax enforcement modes");
     }
  };

  const confirmDelete = async () => {
    try {
      await taxesApi.deleteTax(deleteId);
      toast.success("Tax dropped contextually.");
      setIsConfirmOpen(false);
      fetchTaxes();
    } catch (e) {
      toast.error("Failed to delete tax.");
    }
  };

  const openDelete = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const openEdit = (tax) => {
    setEditingTax(tax);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingTax(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tax Configurations</h1>
          <p className="mt-1 text-slate-500">Regulate universally enforced VAT and sales tax percentage logics globally.</p>
        </div>
        {isAdmin && (
        <button 
          onClick={openCreate}
          className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-rose-500/50"
        >
          Inject Tax Rule
        </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-600">Filter View</span>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={isActiveFilter}
            onChange={e => setIsActiveFilter(e.target.value)}
            className="w-48 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 py-2.5 px-3 outline-none"
          >
            <option value="">All States</option>
            <option value="true">Actively Enforced</option>
            <option value="false">Dormant</option>
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
                title="No Taxes Configured" 
                description="There are currently no governing tax rules rendering active constraints." 
                icon={Receipt} 
             />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  <th className="p-4 pl-6">Tax Label</th>
                  <th className="p-4">Tax Type</th>
                  <th className="p-4 text-center">Percentage Value</th>
                  <th className="p-4 text-center">Status Toggle</th>
                  <th className="p-4 pr-6 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 pl-6 font-bold text-slate-800">{t.name}</td>
                    <td className="p-4 text-slate-600 text-sm">{t.type}</td>
                    <td className="p-4 text-center">
                        <span className="font-mono text-rose-600 font-black bg-rose-50 px-2 py-1 rounded">
                           {Number(t.percentage).toFixed(2)}%
                        </span>
                    </td>
                    <td className="p-4 text-center">
                      <label className={`relative inline-flex items-center ${isAdmin ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                        <input 
                           type="checkbox" 
                           className="sr-only peer" 
                           disabled={!isAdmin}
                           checked={t.isActive}
                           onChange={(e) => inlineToggleActive(t, e.target.checked)} 
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                       {isAdmin ? (
                         <>
                           <button type="button" onClick={() => openEdit(t)} className="p-2 text-slate-400 hover:text-rose-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
                              <Edit2 className="w-4 h-4" />
                           </button>
                           <button type="button" onClick={() => openDelete(t.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
                              <Trash2 className="w-4 h-4" />
                           </button>
                         </>
                       ) : (
                         <span className="text-xs text-slate-400">View only</span>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TaxModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        taxToEdit={editingTax} 
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        title="Nuke Tax Rule?" 
        message="Dropping this tax logic severs connections to any upcoming invoices instantly. Active and historically billed invoices are untoched. Continue?"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default Taxes;
