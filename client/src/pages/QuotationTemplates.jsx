import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/Toast';
import { quotationTemplatesApi } from '../api/quotationTemplates';
import { plansApi } from '../api/plans';
import TemplateForm from '../components/TemplateForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { FileText, Edit2, Trash2 } from 'lucide-react';

const QuotationTemplates = () => {
  const toast = useToast();
  
  const [data, setData] = useState([]);
  const [plansDict, setPlansDict] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await quotationTemplatesApi.getTemplates();
      setData(res);
      
      const pRes = await plansApi.getPlans();
      const pDict = {};
      pRes.forEach(p => { pDict[p.id] = p.name });
      setPlansDict(pDict);

    } catch (e) {
      toast.error('Failed to parse active Template definitions');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Handlers
  const handleSave = async (tData) => {
    try {
      if (editingTemplate) {
        await quotationTemplatesApi.updateTemplate(editingTemplate.id, tData);
        toast.success("Quotation schema updated.");
      } else {
        await quotationTemplatesApi.createTemplate(tData);
        toast.success("New template mapped.");
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (e) {
      toast.error("Template injection dropped heavily.");
    }
  };

  const confirmDelete = async () => {
    try {
      await quotationTemplatesApi.deleteTemplate(deleteId);
      toast.info("Template wiped functionally.");
      setIsConfirmOpen(false);
      fetchTemplates();
    } catch (e) {
      toast.error("Cannot execute destructive query.");
    }
  };

  const openDelete = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const openEdit = (template) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quotation Templates</h1>
          <p className="mt-1 text-slate-500">Accelerate B2B checkout funnels drafting predefined product logic mappings.</p>
        </div>
        <button 
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-blue-500/50"
        >
          Blueprint New SOW
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex justify-center items-center p-12">
            <Spinner size="lg" color="slate" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex justify-center items-center py-12">
             <EmptyState 
                title="No Templates Initialized" 
                description="Zero SOW maps drafted. Accelerate operations securely establishing logic overlays universally." 
                icon={FileText} 
             />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 pb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  <th className="p-4 pl-6">Matrix Identify Name</th>
                  <th className="p-4">Attached Architectural Schema</th>
                  <th className="p-4 text-center">Quote Expiration</th>
                  <th className="p-4 text-center">Hardware / Software Lines</th>
                  <th className="p-4 pr-6 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {data.map(t => {
                  return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                       <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{t.name}</span>
                       <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono">TPL-{t.id}</div>
                    </td>
                    <td className="p-4">
                       {t.planId ? (
                           <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-cyan-200">
                               ⮑ {plansDict[t.planId] || 'Unknown Hook'}
                           </span>
                       ) : (
                           <span className="text-slate-400 italic text-xs">Unattached Scope</span>
                       )}
                    </td>
                    <td className="p-4 text-center">
                       <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-sm">{t.validityDays} Days</span>
                    </td>
                    <td className="p-4 text-center">
                       <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-700 font-bold border border-blue-200 rounded-full text-xs">
                          {t.lines?.length || 0}
                       </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2 whitespace-nowrap">
                       <button onClick={() => openEdit(t)} className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
                          <Edit2 className="w-4 h-4" />
                       </button>
                       <button onClick={() => openDelete(t.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TemplateForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        templateToEdit={editingTemplate} 
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        title="Destroy Pre-Defined Scope?" 
        message="Running this purge invalidates native template allocations heavily. Confirm wiping immediately?"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default QuotationTemplates;
