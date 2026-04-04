import { useState, useEffect } from 'react';
import { X, Receipt, Save } from 'lucide-react';

const TaxModal = ({ isOpen, onClose, onSave, taxToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    percentage: '',
    type: 'Sales',
    isActive: true
  });

  useEffect(() => {
    if (taxToEdit) {
      setFormData({
        name: taxToEdit.name || '',
        percentage: taxToEdit.percentage || '',
        type: taxToEdit.type || 'Sales',
        isActive: taxToEdit.isActive !== undefined ? taxToEdit.isActive : true
      });
    } else {
      setFormData({ name: '', percentage: '', type: 'Sales', isActive: true });
    }
  }, [taxToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      percentage: Number(formData.percentage)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {taxToEdit ? 'Edit Tax Definition' : 'Create Tax Setting'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tax Label</label>
            <input 
              required 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
              placeholder="e.g. Standard VAT"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rate (%)</label>
                <div className="relative">
                   <input 
                     required 
                     type="number" 
                     min="0"
                     max="100"
                     step="0.01"
                     value={formData.percentage}
                     onChange={(e) => setFormData({...formData, percentage: e.target.value})}
                     className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-8 py-2.5 outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                     placeholder="20"
                   />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
             </div>

             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tax Class Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all appearance-none"
                >
                  <option value="Sales">Sales</option>
                  <option value="VAT">VAT</option>
                  <option value="Digital Tax">Digital Tax</option>
                  <option value="Import/Export">Import/Export</option>
                </select>
             </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700 mt-2">Active Enforcement</span>
              <label className="relative inline-flex items-center cursor-pointer mt-2">
                <input 
                   type="checkbox" 
                   value="" 
                   className="sr-only peer" 
                   checked={formData.isActive}
                   onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {taxToEdit ? 'Save Changes' : 'Create Tax Rules'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaxModal;
