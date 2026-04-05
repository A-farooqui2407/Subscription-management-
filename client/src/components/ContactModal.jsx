import { useState, useEffect } from 'react';
import { X, Contact, Save, AlertCircle } from 'lucide-react';
import { validateContactForm } from '../utils/validation';

const ContactModal = ({ isOpen, onClose, onSave, contactToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'customer'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (contactToEdit) {
      setFormData({
        name: contactToEdit.name || '',
        email: contactToEdit.email || '',
        phone: contactToEdit.phone || '',
        type: contactToEdit.type || 'customer'
      });
    } else {
      setFormData({ name: '', email: '', phone: '', type: 'customer' });
    }
    setErrors({});
  }, [contactToEdit, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateContactForm(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      onSave({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone ? formData.phone.trim() : null,
        type: formData.type
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Contact className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {contactToEdit ? 'Edit Contact' : 'Create Contact'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Name</label>
            <input 
              required 
              type="text" 
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 outline-none focus:ring-2 transition-all ${
                errors.name ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-300 focus:ring-emerald-500/50 focus:border-emerald-500'
              }`}
              placeholder="e.g. Acme Corp / Jane Doe"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input 
              required 
              type="email" 
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 outline-none focus:ring-2 transition-all ${
                errors.email ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-300 focus:ring-emerald-500/50 focus:border-emerald-500'
              }`}
              placeholder="contact@company.com"
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone (Indian Format)</label>
            <input 
              type="text" 
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 outline-none focus:ring-2 transition-all ${
                errors.phone ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-300 focus:ring-emerald-500/50 focus:border-emerald-500'
              }`}
              placeholder="e.g. 9876543210 or +91 9876543210"
              disabled={isSubmitting}
            />
            {errors.phone && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.phone}</p>}
            {!errors.phone && formData.phone && (
              <p className="text-green-600 text-xs mt-1">✓ Valid Indian phone number</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Type</label>
            <select 
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none"
              disabled={isSubmitting}
            >
              <option value="customer">Customer</option>
              <option value="subscriber">Subscriber</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {contactToEdit ? 'Save Changes' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
