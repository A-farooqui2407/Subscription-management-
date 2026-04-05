import { Plus, Trash2 } from 'lucide-react';

const OrderLinesTable = ({ lines, setLines, products, taxes, readOnly = false }) => {
  
  const handleAddLine = () => {
    if (readOnly) return;
    setLines([...lines, { id: Date.now(), productId: '', variantId: '', taxId: '', qty: 1, unitPrice: 0 }]);
  };

  const handleRemoveLine = (index) => {
    if (readOnly) return;
    const newLines = [...lines];
    newLines.splice(index, 1);
    setLines(newLines);
  };

  const updateLine = (index, field, value) => {
    if (readOnly) return;
    const newLines = [...lines];
    const updatedLine = { ...newLines[index], [field]: value };
    
    // Auto-fetch price if product changes
    if (field === 'productId') {
        const prod = products.find((p) => String(p.id) === String(value));
        if (prod) {
            updatedLine.unitPrice = prod.salesPrice || 0;
            updatedLine.variantId = ''; // Reset variant
        }
    }
    
    newLines[index] = updatedLine;
    setLines(newLines);
  };
  
  const calculateAmount = (line) => {
      return (Number(line.qty) || 0) * (Number(line.unitPrice) || 0);
  };

  const totals = lines.reduce((acc, line) => {
      const amount = calculateAmount(line);
      acc.subtotal += amount;
      
      const taxConfig = taxes.find((t) => String(t.id) === String(line.taxId));
      if (taxConfig && taxConfig.percentage) {
         acc.tax += amount * (taxConfig.percentage / 100);
      }
      return acc;
  }, { subtotal: 0, tax: 0 });

  const grandTotal = totals.subtotal + totals.tax;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm mt-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    <th className="p-3 pl-6">Product Core</th>
                    <th className="p-3">Variant Match</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3">Tax Group</th>
                    <th className="p-3 text-right">Total Amount</th>
                    {!readOnly && <th className="p-3 pr-6 text-right">Remove</th>}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {lines.map((line, index) => {
                    const selectedProduct = products.find(
                      (p) => String(p.id) === String(line.productId),
                    );
                    const availableVariants = selectedProduct?.variants || [];
                    const lineAmount = calculateAmount(line);
                    
                    return (
                        <tr key={line.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 pl-6 min-w-[200px]">
                                <select 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
                                    value={line.productId}
                                    onChange={e => updateLine(index, 'productId', e.target.value)}
                                    disabled={readOnly}
                                >
                                    <option value="" disabled>Select Core Product</option>
                                    {products.map(p => (
                                       <option key={p.id} value={p.id}>{p.name}</option> 
                                    ))}
                                </select>
                            </td>
                            <td className="p-3 min-w-[150px]">
                                <select 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:opacity-75"
                                    value={line.variantId}
                                    onChange={e => updateLine(index, 'variantId', e.target.value)}
                                    disabled={readOnly || availableVariants.length === 0}
                                >
                                    <option value="">{availableVariants.length > 0 ? "Default" : "No variants"}</option>
                                    {availableVariants.map(v => (
                                       <option key={v.id} value={v.id}>{v.attribute}: {v.value} {v.extraPrice > 0 ? `(+$${v.extraPrice})` : ''}</option> 
                                    ))}
                                </select>
                            </td>
                            <td className="p-3 w-32">
                                <input 
                                   type="number" 
                                   min="1"
                                   className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
                                   value={line.qty}
                                   onChange={e => updateLine(index, 'qty', e.target.value)}
                                   disabled={readOnly}
                                />
                            </td>
                            <td className="p-3 w-36">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                    <input 
                                      type="number"
                                      step="0.01" 
                                      className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 text-right font-medium"
                                      value={line.unitPrice}
                                      onChange={e => updateLine(index, 'unitPrice', e.target.value)}
                                      disabled={readOnly}
                                    />
                                </div>
                            </td>
                            <td className="p-3 min-w-[150px]">
                                <select 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
                                    value={line.taxId || ''}
                                    onChange={e => updateLine(index, 'taxId', e.target.value)}
                                    disabled={readOnly}
                                >
                                    <option value="">No Tax Appls.</option>
                                    {taxes.filter(t => t.isActive).map(t => (
                                       <option key={t.id} value={t.id}>{t.name} ({t.percentage}%)</option> 
                                    ))}
                                </select>
                            </td>
                            <td className="p-3 text-right font-black text-slate-800 tracking-tight">
                                ${lineAmount.toFixed(2)}
                            </td>
                            {!readOnly && (
                            <td className="p-3 pr-6 text-right">
                                <button type="button" onClick={() => handleRemoveLine(index)} className="p-1.5 text-slate-300 hover:text-red-600 bg-white hover:bg-red-50 rounded transition-all">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                            )}
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>

      <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center">
         {!readOnly ? (
            <button 
              type="button" 
              onClick={handleAddLine}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Next Line
            </button>
         ) : <div />}

         <div className="flex flex-col gap-1.5 mt-4 md:mt-0 w-full md:w-64 text-sm font-medium">
             <div className="flex justify-between text-slate-500">
                <span>Subtotal Metric:</span>
                <span>${totals.subtotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-slate-500">
                <span>Calculated Tax:</span>
                <span>${totals.tax.toFixed(2)}</span>
             </div>
             <div className="flex justify-between border-t border-slate-200 mt-1 pt-2 font-black text-slate-900 text-lg">
                <span>Gross Total:</span>
                <span className="text-blue-600">${grandTotal.toFixed(2)}</span>
             </div>
         </div>
      </div>
    </div>
  );
};

export default OrderLinesTable;
