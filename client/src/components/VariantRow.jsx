import { useState } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';

const VariantRow = ({ variant, onSave, onDelete, isAdmin }) => {
  const [isEditing, setIsEditing] = useState(!variant.id); // Active immediately if it's new
  const [formData, setFormData] = useState({
    attribute: variant.attribute || '',
    value: variant.value || '',
    extraPrice: variant.extraPrice || 0
  });

  const handleSave = () => {
    // Validate
    if (!formData.attribute || !formData.value) return;
    
    setIsEditing(false);
    onSave({
      ...variant,
      ...formData,
      extraPrice: Number(formData.extraPrice)
    });
  };

  const handleCancel = () => {
    if (!variant.id) {
      // It was an unsaved row mapped from an array, so trigger delete to clear it from parent tracking
      onDelete(variant);
    } else {
      setIsEditing(false);
      setFormData({
        attribute: variant.attribute || '',
        value: variant.value || '',
        extraPrice: variant.extraPrice || 0
      });
    }
  };

  if (isEditing) {
    return (
      <tr className="bg-blue-50/50">
        <td className="p-3 pl-6">
          <input 
            type="text" 
            placeholder="e.g. Storage"
            value={formData.attribute}
            onChange={e => setFormData({ ...formData, attribute: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 text-sm"
          />
        </td>
        <td className="p-3">
          <input 
            type="text" 
            placeholder="e.g. 500GB"
            value={formData.value}
            onChange={e => setFormData({ ...formData, value: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 text-sm"
          />
        </td>
        <td className="p-3">
          <div className="relative">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
             <input 
               type="number" 
               placeholder="0"
               value={formData.extraPrice}
               onChange={e => setFormData({ ...formData, extraPrice: e.target.value })}
               className="w-24 bg-white border border-slate-300 rounded-lg pl-6 pr-3 py-1.5 outline-none focus:border-blue-500 text-sm"
             />
          </div>
        </td>
        <td className="p-3 pr-6 text-right space-x-2">
          <button onClick={handleSave} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={handleCancel} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-slate-50 border-b border-slate-50 last:border-none group">
      <td className="p-3 pl-6 font-medium text-slate-800">{variant.attribute}</td>
      <td className="p-3 text-slate-600">{variant.value}</td>
      <td className="p-3 text-slate-600">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
          variant.extraPrice > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
        }`}>
          {variant.extraPrice > 0 ? `+$${Number(variant.extraPrice).toFixed(2)}` : 'Standard'}
        </span>
      </td>
      <td className="p-3 pr-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
        {isAdmin && (
          <div className="space-x-1">
            <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
             <button onClick={() => onDelete(variant)} className="p-1.5 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default VariantRow;
