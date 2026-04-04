import { useState, useEffect } from 'react';
import { X, CreditCard, Save } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, onSave, invoice }) => {
  const [formData, setFormData] = useState({
    method: 'Bank Transfer',
    amount: '',
    date: ''
  });

  const paidSoFar =
    (invoice?.payments && invoice.payments.reduce((s, p) => s + Number(p.amount || 0), 0)) ||
    Number(invoice?.amountPaid || 0);
  const remainingBalance = invoice ? (Number(invoice.total) - paidSoFar).toFixed(2) : 0;

  useEffect(() => {
    if (isOpen && invoice) {
        setFormData({
            method: 'Bank Transfer',
            amount: remainingBalance,
            date: new Date().toISOString().split('T')[0]
        });
    }
  }, [isOpen, invoice, remainingBalance]);

  if (!isOpen || !invoice) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: Number(formData.amount),
      invoiceId: invoice.id,
      customerId: invoice.customerId
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Record Payment Hook</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex justify-between items-center mb-6">
             <span className="text-sm font-bold text-emerald-800 tracking-wide">Pending Balance Trace:</span>
             <span className="text-xl font-black text-emerald-600 tracking-tighter">${remainingBalance}</span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Payment Method Gateway</label>
            <select 
              value={formData.method}
              onChange={(e) => setFormData({...formData, method: e.target.value})}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm appearance-none"
            >
              <option value="Bank Transfer">Bank Transfer (Core)</option>
              <option value="Card">Credit / Debit Card</option>
              <option value="Cash">Physical Cash</option>
              <option value="UPI">UPI / Digital Gateway</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cleared Amount ($)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01"
                  max={remainingBalance}
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-mono text-right"
                />
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Execution Date</label>
                <input 
                  required 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
                />
             </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors shadow-sm"
            >
              Abort Payment
            </button>
            <button 
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
