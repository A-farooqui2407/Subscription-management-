import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { contactsApi } from '../api/contacts';
import ContactModal from '../components/ContactModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { Search, Edit2, Trash2, Filter, Contact } from 'lucide-react';

const Contacts = () => {
  const { canWrite } = useAuth();
  const toast = useToast();
  
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Params
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  
  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const { rows, meta } = await contactsApi.getContacts({ search, type: typeFilter, page, limit });
      setData(rows);
      setTotal(meta.total ?? 0);
    } catch (e) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, page, limit]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Handlers
  const handleSave = async (contactData) => {
    try {
      if (editingContact) {
        await contactsApi.updateContact(editingContact.id, contactData);
        toast.success("Contact updated successfully");
      } else {
        await contactsApi.createContact(contactData);
        toast.success("Contact added seamlessly");
      }
      setIsModalOpen(false);
      fetchContacts();
    } catch (e) {
      toast.error("An error occurred updating the contact pipeline");
    }
  };

  const confirmDelete = async () => {
    try {
      await contactsApi.deleteContact(deleteId);
      toast.success("Contact permanently deleted.");
      setIsConfirmOpen(false);
      fetchContacts();
    } catch (e) {
      toast.error("Failed to execute deletion protocol");
    }
  };

  const openDelete = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const openEdit = (contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const TypeBadge = ({ type }) => {
    const map = {
      lead: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      customer: 'bg-blue-100 text-blue-800 border-blue-200',
      partner: 'bg-purple-100 text-purple-800 border-purple-200',
      vendor: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    
    const appliedClass = map[type?.toLowerCase()] || map.lead;
    return (
      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${appliedClass}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact CRM Directory</h1>
          <p className="mt-1 text-slate-500">Pipeline assignments and external relationships mapped contextually.</p>
        </div>
        {canWrite && (
        <button 
          onClick={openCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-emerald-500/50"
        >
          Add Contact
        </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search organizations or emails..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-48 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 py-2.5 px-3 outline-none"
          >
            <option value="">All Types</option>
            <option value="Lead">Leads</option>
            <option value="Customer">Customers</option>
            <option value="Partner">Partners</option>
            <option value="Vendor">Vendors</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex justify-center items-center p-12">
            <Spinner size="lg" color="blue" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex justify-center items-center py-12">
             <EmptyState 
                title="No Contacts Synchronized" 
                description="Unable to locate contacts matching your filter combinations." 
                icon={Contact} 
             />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  <th className="p-4 pl-6">Contact Name</th>
                  <th className="p-4">Email Routing</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 pl-6 font-bold text-slate-800">{c.name}</td>
                    <td className="p-4 text-slate-600 text-sm">{c.email}</td>
                    <td className="p-4 text-slate-500 text-sm font-mono">{c.phone || '-'}</td>
                    <td className="p-4"><TypeBadge type={c.type} /></td>
                    <td className="p-4 pr-6 text-right space-x-2">
                       {canWrite ? (
                         <>
                           <button type="button" onClick={() => openEdit(c)} className="p-2 text-slate-400 hover:text-emerald-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
                              <Edit2 className="w-4 h-4" />
                           </button>
                           <button type="button" onClick={() => openDelete(c.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
                              <Trash2 className="w-4 h-4" />
                           </button>
                         </>
                       ) : (
                         <span className="text-xs text-slate-400">View only</span>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && data.length > 0 && (
          <Pagination total={total} page={page} limit={limit} onPageChange={setPage} />
        )}
      </div>

      <ContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        contactToEdit={editingContact} 
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        title="Remove Contact Permanently?" 
        message="Destroying this contact will unlink associated pipeline stages contextually. Confirm database drop?"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default Contacts;
