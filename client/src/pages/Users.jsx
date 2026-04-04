import { useState, useEffect, useCallback } from 'react';
import { useAuth, normalizeRole } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { usersApi } from '../api/users';
import UserModal from '../components/UserModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { Search, Edit2, Trash2, Filter, Users as UsersIcon } from 'lucide-react';

/** UI filter / form slugs → Sequelize ENUM */
function uiRoleToApi(roleUi) {
  if (roleUi === 'internalUser') return 'InternalUser';
  if (roleUi === 'admin') return 'Admin';
  return 'PortalUser';
}

const Users = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Params
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const role =
        roleFilter === '' ? undefined : uiRoleToApi(roleFilter);
      const { rows, meta } = await usersApi.getUsers({ search, role, page, limit });
      setData(rows);
      setTotal(meta.total ?? 0);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handlers
  const handleSave = async (userData) => {
    const editingIsAdmin = editingUser && normalizeRole(editingUser.role) === 'admin';
    try {
      if (editingUser) {
        const patch = {
          name: userData.name,
          email: userData.email,
        };
        if (!editingIsAdmin) {
          patch.role = uiRoleToApi(userData.role);
        }
        await usersApi.updateUser(editingUser.id, patch);
        toast.success("User updated successfully");
      } else {
        const apiRole = uiRoleToApi(userData.role);
        if (apiRole === 'Admin') {
          toast.error('Administrator accounts cannot be created from the app.');
          return;
        }
        await usersApi.createUser({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: apiRole,
        });
        toast.success("User created successfully");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.message ||
        'Could not save user.';
      toast.error(msg);
    }
  };

  const confirmDelete = async () => {
    try {
      await usersApi.deleteUser(deleteId);
      toast.success("User removed");
      setIsConfirmOpen(false);
      fetchUsers();
    } catch (e) {
      toast.error("Failed to delete user");
    }
  };

  const openDelete = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const RoleBadge = ({ r }) => {
    const map = {
      admin: { label: 'Administrator', classes: 'bg-purple-100 text-purple-800 border-purple-200' },
      internalUser: { label: 'Internal Staff', classes: 'bg-blue-100 text-blue-800 border-blue-200' },
      user: { label: 'Portal User', classes: 'bg-slate-100 text-slate-700 border-slate-200' }
    };
    const mapped = map[r] || map.user;
    return (
      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${mapped.classes}`}>
        {mapped.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="mt-1 text-slate-500">Manage internal teammates and client portal assignments.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-blue-500/50"
          >
            Create User
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-48 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2.5 px-3 outline-none"
          >
            <option value="">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="internalUser">Internal Staff</option>
            <option value="user">Portal User</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex justify-center items-center p-12">
            <Spinner size="lg" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex justify-center items-center py-12">
             <EmptyState 
                title="No Users Found" 
                description="Try adjusting your current filters or contact the administrator to create accounts." 
                icon={UsersIcon} 
             />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  <th className="p-4 pl-6">Full Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 pl-6 font-bold text-slate-800">{u.name}</td>
                    <td className="p-4 text-slate-600 text-sm">{u.email}</td>
                    <td className="p-4"><RoleBadge r={normalizeRole(u.role)} /></td>
                    <td className="p-4 pr-6 text-right space-x-2">
                       {isAdmin ? (
                         <>
                           <button type="button" onClick={() => openEdit(u)} className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
                              <Edit2 className="w-4 h-4" />
                           </button>
                           <button type="button" onClick={() => openDelete(u.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
                              <Trash2 className="w-4 h-4" />
                           </button>
                         </>
                       ) : (
                         <span className="text-xs text-slate-400 font-medium">View only</span>
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

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        userToEdit={editingUser}
        editingIsAdmin={Boolean(editingUser && normalizeRole(editingUser.role) === 'admin')}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        title="Revoke User Access?" 
        message="Are you sure you want to delete this user permanently? This action cannot be undone and will forcefully disconnect any active sessions immediately."
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default Users;
