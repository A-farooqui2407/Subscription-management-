import { useState, useEffect, useCallback } from 'react';
import { X, FileText, Save } from 'lucide-react';
import OrderLinesTable from './OrderLinesTable';
import { productsApi } from '../api/products';
import { plansApi } from '../api/plans';
import { taxesApi } from '../api/taxes';

const TemplateForm = ({ isOpen, onClose, onSave, templateToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    validityDays: 30,
    planId: ''
  });
  
  const [lines, setLines] = useState([]);
  
  // Dependencies data
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [taxes, setTaxes] = useState([]);

  useEffect(() => {
    if (isOpen) {
        productsApi.getProducts({ limit: 100, page: 1 }).then((res) => setProducts(res.rows));
        plansApi.getPlans({ limit: 100, page: 1 }).then((res) => setPlans(res.rows));
        taxesApi.getTaxes().then((list) => setTaxes(Array.isArray(list) ? list : []));
    }
  }, [isOpen]);

  useEffect(() => {
    if (templateToEdit) {
      setFormData({
        name: templateToEdit.name || '',
        validityDays: templateToEdit.validityDays || 30,
        planId: templateToEdit.planId || ''
      });
      setLines(templateToEdit.lines || []);
    } else {
      setFormData({ name: '', validityDays: 30, planId: '' });
      setLines([]);
    }
  }, [templateToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      validityDays: Number(formData.validityDays),
      lines
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {templateToEdit ? 'Edit Scope of Work Template' : 'Create Quotation Template'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Template Blueprint Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                    placeholder="e.g. Standard B2B Enterprise Setup"
                  />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Validity Gap (Days)</label>
                  <input 
                    type="number"
                    min="1" 
                    value={formData.validityDays}
                    onChange={(e) => setFormData({...formData, validityDays: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                  />
               </div>

               <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assigned Target Plan Schema</label>
                  <select 
                    value={formData.planId}
                    onChange={(e) => setFormData({...formData, planId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm appearance-none"
                  >
                    <option value="">No Recurrent Hooks Applied (One-off)</option>
                    {plans.filter(p => p.isActive).map(p => (
                       <option key={p.id} value={p.id}>Bind → {p.name} (${Number(p.price).toFixed(2)}/cycle)</option>
                    ))}
                  </select>
               </div>
            </div>

            <div>
               <h3 className="text-base font-bold text-slate-800 mb-2">Order Line Mapping</h3>
               <p className="text-xs text-slate-500 mb-4">Dynamically prefill line items specifically configuring physical properties automatically.</p>
               
               <OrderLinesTable 
                   lines={lines} 
                   setLines={setLines} 
                   products={products} 
                   taxes={taxes} 
               />
            </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3 flex-shrink-0 bg-slate-50">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors shadow-sm"
            >
              Cancel Edit
            </button>
            <button 
              type="button"
              onClick={handleSubmit}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {templateToEdit ? 'Save Template Overlay' : 'Publish Quotation Blueprint'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateForm;
