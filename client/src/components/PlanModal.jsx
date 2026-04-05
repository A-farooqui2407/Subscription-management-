import { useState, useEffect } from 'react';
import { X, Tags, Save } from 'lucide-react';

const PlanModal = ({ isOpen, onClose, onSave, planToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    billingPeriod: 'monthly',
    minQty: '',
    startDate: '',
    endDate: '',
    options: {
      autoClose: false,
      closable: true,
      pausable: true,
      renewable: true
    },
    isActive: true
  });

  useEffect(() => {
    if (planToEdit) {
      setFormData({
        name: planToEdit.name || '',
        price: planToEdit.price || '',
        billingPeriod: String(planToEdit.billingPeriod || 'monthly').toLowerCase(),
        minQty: planToEdit.minQty || '',
        startDate: planToEdit.startDate || '',
        endDate: planToEdit.endDate || '',
        options: {
          autoClose: planToEdit.autoClose ?? planToEdit.options?.autoClose ?? false,
          closable: planToEdit.closable ?? planToEdit.options?.closable ?? true,
          pausable: planToEdit.pausable ?? planToEdit.options?.pausable ?? true,
          renewable: planToEdit.renewable ?? planToEdit.options?.renewable ?? true,
        },
        isActive: planToEdit.isActive !== undefined ? planToEdit.isActive : true,
      });
    } else {
      setFormData({
        name: '',
        price: '',
        billingPeriod: 'monthly',
        minQty: '',
        startDate: '',
        endDate: '',
        options: { autoClose: false, closable: true, pausable: true, renewable: true },
        isActive: true,
      });
    }
  }, [planToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const bp = String(formData.billingPeriod || 'monthly').toLowerCase();
    onSave({
      name: formData.name.trim(),
      price: Number(formData.price),
      billingPeriod: bp,
      minQty: formData.minQty ? Number(formData.minQty) : 1,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      autoClose: Boolean(formData.options?.autoClose),
      closable: Boolean(formData.options?.closable),
      pausable: Boolean(formData.options?.pausable),
      renewable: Boolean(formData.options?.renewable),
      isActive: Boolean(formData.isActive),
    });
  };

  const handleOptionToggle = (key) => {
    setFormData({
      ...formData,
      options: {
        ...formData.options,
        [key]: !formData.options[key]
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Tags className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {planToEdit ? 'Edit Plan Schema' : 'Create Recurring Plan'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Plan Identity</label>
            <input 
              required 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm"
              placeholder="e.g. Premium Business Tier"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Billing Period Cycle</label>
                <select 
                  value={formData.billingPeriod}
                  onChange={(e) => setFormData({...formData, billingPeriod: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all appearance-none text-sm font-medium"
                >
                  <option value="daily">Daily Execution</option>
                  <option value="weekly">Weekly Execution</option>
                  <option value="monthly">Monthly Execution</option>
                  <option value="yearly">Yearly Execution</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Set Price ($)</label>
                <input 
                  required 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm font-mono"
                  placeholder="29.99"
                />
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="sm:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Min. Order Qty</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.minQty}
                  onChange={(e) => setFormData({...formData, minQty: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm"
                  placeholder="Defaults to 1"
                />
             </div>
             <div className="sm:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    Start Date <span className="text-[10px] font-normal text-slate-400 leading-none">Optional</span>
                </label>
                <input 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm"
                />
             </div>
             <div className="sm:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    End Date <span className="text-[10px] font-normal text-slate-400 leading-none">Optional</span>
                </label>
                <input 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm"
                />
             </div>
          </div>

          <div className="border border-slate-100 bg-slate-50 rounded-xl p-4 mt-2">
              <label className="block text-sm font-bold text-slate-700 mb-3">Behavioral Parameters</label>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                 {[
                   { key: 'autoClose', label: 'Auto-Close', dev: 'Deactivates automatically upon End Date' },
                   { key: 'closable', label: 'Closable', dev: 'Client can cancel subscription manually' },
                   { key: 'pausable', label: 'Pausable', dev: 'Client can pause billing cycles' },
                   { key: 'renewable', label: 'Renewable', dev: 'Engine automatically renews on expiry' }
                 ].map((opt) => (
                    <label key={opt.key} className="flex flex-col cursor-pointer group">
                        <div className="flex items-center gap-2">
                           <input 
                             type="checkbox" 
                             checked={formData.options[opt.key]}
                             onChange={() => handleOptionToggle(opt.key)}
                             className="w-4 h-4 text-cyan-600 bg-white border-slate-300 rounded focus:ring-cyan-500 focus:ring-2"
                           />
                           <span className="text-sm font-semibold text-slate-800">{opt.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 pl-6 transition-colors group-hover:text-cyan-600 leading-tight">
                           {opt.dev}
                        </span>
                    </label>
                 ))}
              </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-sm font-bold text-slate-700 mt-2">Plan Registration Active</span>
              <label className="relative inline-flex items-center cursor-pointer mt-2">
                <input 
                   type="checkbox" 
                   value="" 
                   className="sr-only peer" 
                   checked={formData.isActive}
                   onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
          </div>

          <div className="pt-2 flex gap-3 pb-2 flex-shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {planToEdit ? 'Save Schema' : 'Initialize Plan Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanModal;
