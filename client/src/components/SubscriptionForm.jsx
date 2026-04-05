import { useState, useEffect } from 'react';
import { X, Send, Save, CreditCard } from 'lucide-react';
import OrderLinesTable from './OrderLinesTable';
import { productsApi } from '../api/products';
import { plansApi } from '../api/plans';
import { taxesApi } from '../api/taxes';
import { contactsApi } from '../api/contacts';
import { quotationTemplatesApi } from '../api/quotationTemplates';
import { discountsApi } from '../api/discounts';
import { useToast } from './Toast';

function toOrderLinesForApi(lines) {
  return lines
    .filter((l) => l && l.productId)
    .map((l) => {
      const row = {
        productId: l.productId,
        qty: parseInt(l.qty, 10) || 1,
        unitPrice: Number(l.unitPrice) || 0,
      };
      if (l.variantId) row.variantId = l.variantId;
      if (l.taxId) row.taxId = l.taxId;
      return row;
    });
}

const SubscriptionForm = ({ isOpen, onClose, onSave }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    customerId: '',
    planId: '',
    startDate: '',
    expirationDate: '',
    paymentTerms: 'NET 30',
    discountId: '',
    status: 'draft'
  });
  
  const [lines, setLines] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  // Dependencies data
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    if (isOpen) {
        productsApi.getProducts({ limit: 100, page: 1 }).then((res) => setProducts(res.rows));
        plansApi.getPlans({ limit: 100, page: 1 }).then((res) => setPlans(res.rows));
        taxesApi.getTaxes().then((list) => setTaxes(Array.isArray(list) ? list : []));
        contactsApi.getContacts({ limit: 100, page: 1 }).then((res) => setContacts(res.rows));
        quotationTemplatesApi.getTemplates({ limit: 100, page: 1 }).then((res) => setTemplates(res.rows));
        discountsApi.getDiscounts({ isActive: 'true', limit: 100, page: 1 }).then((res) => setDiscounts(res.rows));
        
        // Reset state on open since this is pure creation
        setFormData({ customerId: '', planId: '', startDate: new Date().toISOString().split('T')[0], expirationDate: '', paymentTerms: 'NET 30', discountId: '', status: 'draft' });
        setLines([]);
        setSelectedTemplate('');
    }
  }, [isOpen]);

  const handleTemplateChange = async (e) => {
      const tId = e.target.value;
      setSelectedTemplate(tId);
      if (!tId) return;

      const tmpl = templates.find((t) => String(t.id) === String(tId));
      if (tmpl) {
          const raw = tmpl.productLines || tmpl.lines || [];
          const mapped = (Array.isArray(raw) ? raw : []).map((l, i) => ({
            id: `sub-line-${i}-${l.productId || i}`,
            productId: l.productId ?? '',
            variantId: l.variantId ?? '',
            taxId: l.taxId ?? '',
            qty: l.qty ?? 1,
            unitPrice: l.unitPrice ?? 0,
          }));
          setFormData((prev) => ({
            ...prev,
            planId: tmpl.planId || '',
          }));
          setLines(mapped);
      }
  };

  const handlePlanChange = (e) => {
      const pId = e.target.value;
      
      const p = plans.find((x) => String(x.id) === String(pId));
      if (p && p.billingPeriod && formData.startDate) {
          const sd = new Date(formData.startDate);
          const cycle = String(p.billingPeriod).toLowerCase();
          if (cycle === 'monthly') sd.setMonth(sd.getMonth() + 1);
          else if (cycle === 'yearly') sd.setFullYear(sd.getFullYear() + 1);
          else if (cycle === 'weekly') sd.setDate(sd.getDate() + 7);
          else if (cycle === 'daily') sd.setDate(sd.getDate() + 1);
          
          setFormData({ ...formData, planId: pId, expirationDate: sd.toISOString().split('T')[0] });
      } else {
          setFormData({ ...formData, planId: pId });
      }
  };

  if (!isOpen) return null;

  const handleSubmit = (actionType) => {
    if (!formData.customerId || !formData.planId || !formData.startDate) {
      toast.warning('Select a customer, plan, and start date.');
      return;
    }
    const orderLines = toOrderLinesForApi(lines);
    if (orderLines.length < 1) {
      toast.warning('Add at least one order line with a product selected.');
      return;
    }
    onSave({
      customerId: formData.customerId,
      planId: formData.planId,
      startDate: formData.startDate,
      paymentTerms: formData.paymentTerms || null,
      discountId: formData.discountId || undefined,
      orderLines,
      status: actionType,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0 bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
               <h2 className="text-xl font-bold text-slate-800">Boot Subscription Checkouts</h2>
               <p className="text-xs text-slate-500 font-medium">Build explicit contractual arrays mapping invoices logically.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 p-6 space-y-6">
            
            {/* Template Overrides Shortcut */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
               <div>
                  <h4 className="text-sm font-bold text-blue-900">Autofill Strategy Toolkit</h4>
                  <p className="text-xs text-blue-700">Exploit existing Templates natively importing predefined line schemas directly.</p>
               </div>
               <select 
                   value={selectedTemplate}
                   onChange={handleTemplateChange}
                   className="w-full sm:w-64 bg-white border border-blue-200 text-blue-900 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-medium"
               >
                   <option value="">Start from Scratch</option>
                   {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
               </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Attached Customer Source</label>
                  <select 
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm appearance-none"
                  >
                    <option value="" disabled>Select Target Client</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Governing Architecture Schema</label>
                  <select 
                    value={formData.planId}
                    onChange={handlePlanChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm appearance-none"
                  >
                    <option value="">Detached Subscriptions Array (Standalone)</option>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price}/{p.billingPeriod}</option>)}
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Execution Start Logic</label>
                  <input 
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                  />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expiration Hook</label>
                  <input 
                    type="date" 
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                  />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Payment Terms Binding</label>
                  <input 
                    type="text" 
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                    placeholder="e.g. NET 30"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Discount Strategies Overlay</label>
               <select 
                 value={formData.discountId}
                 onChange={(e) => setFormData({...formData, discountId: e.target.value})}
                 className="w-full sm:w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm appearance-none"
               >
                 <option value="">No Active Promotions Configured</option>
                 {discounts.map(d => <option key={d.id} value={d.id}>{d.name} ({d.type === 'Percentage' ? d.value + '%' : '$' + d.value} OFF)</option>)}
               </select>
            </div>

            <div className="pt-4 border-t border-slate-200">
               <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Order Line Configuration Arrays</h3>
               <OrderLinesTable 
                   lines={lines} 
                   setLines={setLines} 
                   products={products} 
                   taxes={taxes} 
               />
            </div>
        </div>

        <div className="p-5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 flex-shrink-0">
            <span className="text-xs text-slate-400 font-medium">Verify matrices intimately avoiding detached tax vectors before dispatching arrays natively.</span>
            <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  type="button" 
                  onClick={() => handleSubmit('draft')}
                  className="flex-1 sm:flex-none py-2.5 px-6 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4 text-slate-500" />
                  Save as Draft
                </button>
                <button 
                  type="button"
                  onClick={() => handleSubmit('quotation')}
                  className="flex-1 sm:flex-none py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Issue Quotation Vector
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionForm;
