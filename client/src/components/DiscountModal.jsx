import { useState, useEffect } from 'react';
import { X, Percent, Save } from 'lucide-react';

const DiscountModal = ({ isOpen, onClose, onSave, discountToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Percentage',
    value: '',
    minPurchase: '',
    minQty: '',
    startDate: '',
    endDate: '',
    limitUsage: '',
    appliesTo: 'Subscriptions',
    isActive: true
  });

  useEffect(() => {
    if (discountToEdit) {
      setFormData({
        name: discountToEdit.name || '',
        type: discountToEdit.type || 'percentage',
        value: discountToEdit.value || '',
        minPurchase: discountToEdit.minPurchase || '',
        minQty: discountToEdit.minQty || '',
        startDate: discountToEdit.startDate || '',
        endDate: discountToEdit.endDate || '',
        limitUsage: discountToEdit.limitUsage || '',
        appliesTo: discountToEdit.appliesTo || 'subscriptions',
        isActive: discountToEdit.isActive !== undefined ? discountToEdit.isActive : true
      });
    } else {
      setFormData({ 
        name: '', type: 'percentage', value: '', 
        minPurchase: '', minQty: '', startDate: '', endDate: '', 
        limitUsage: '', appliesTo: 'subscriptions', isActive: true 
      });
    }
  }, [discountToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      value: Number(formData.value),
      minPurchase: formData.minPurchase ? Number(formData.minPurchase) : 0,
      minQty: formData.minQty ? Number(formData.minQty) : 0,
      limitUsage: formData.limitUsage ? Number(formData.limitUsage) : null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {discountToEdit ? 'Edit Discount Strategy' : 'Create New Discount'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Promotion Keyword / Name</label>
            <input 
              required 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
              placeholder="e.g. SUMMER26"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Discount Metric</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all appearance-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Value Deducted</label>
                <input 
                  required 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  placeholder="20"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Min. Order Value ($)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({...formData, minPurchase: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  placeholder="0.00"
                />
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Min. Quantity</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.minQty}
                  onChange={(e) => setFormData({...formData, minQty: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  placeholder="0"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 mt-4 pt-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
                <input 
                  required 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm"
                />
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
                <input 
                  required
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Strict Usage Limit</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.limitUsage}
                  onChange={(e) => setFormData({...formData, limitUsage: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm"
                  placeholder="Leave empty for infinite"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Applies Targeting</label>
                <select 
                  value={formData.appliesTo}
                  onChange={(e) => setFormData({...formData, appliesTo: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all appearance-none text-sm"
                >
                  <option value="subscriptions">Applies to Subscriptions</option>
                  <option value="products">Applies to Products</option>
                </select>
             </div>
          </div>

          <div className="pt-2 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-sm font-bold text-slate-700">Promo Execution Status</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                   type="checkbox" 
                   value="" 
                   className="sr-only peer" 
                   checked={formData.isActive}
                   onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
          </div>

          <div className="pt-4 flex gap-3 pb-2 flex-shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {discountToEdit ? 'Save Changes' : 'Activate Discount'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountModal;
