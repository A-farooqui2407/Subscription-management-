import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { productsApi } from '../api/products';
import ProductModal from '../components/ProductModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { Search, Edit2, Trash2, Filter, Box, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
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
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { rows, meta } = await productsApi.getProducts({
        search,
        productType: typeFilter || undefined,
        page,
        limit,
      });
      setData(rows);
      setTotal(meta.total ?? 0);
    } catch (e) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers
  const handleSave = async (productData) => {
    try {
      if (editingProduct) {
        await productsApi.updateProduct(editingProduct.id, productData);
        toast.success("Product updated successfully");
      } else {
        await productsApi.createProduct(productData);
        toast.success("Product created successfully");
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.message ||
        'Could not save the product.';
      toast.error(msg);
    }
  };

  const confirmDelete = async () => {
    try {
      await productsApi.deleteProduct(deleteId);
      toast.success("Product removed permanently.");
      setIsConfirmOpen(false);
      fetchProducts();
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.message ||
        'Could not delete the product.';
      toast.error(msg);
    }
  };

  const openDelete = (e, id) => {
    e.stopPropagation(); // Prevent row click
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const openEdit = (e, product) => {
    e.stopPropagation(); // Prevent row click
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleRowClick = (id) => {
    navigate(`/products/${id}`);
  };

  const TypeBadge = ({ type }) => {
    const map = {
      service: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      physical: 'bg-amber-100 text-amber-800 border-amber-200',
      digital: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
    
    const appliedClass = map[type?.toLowerCase()] || map.service;
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="mt-1 text-slate-500">Manage base offerings, tiers, and standalone items deployed to portals.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={openCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500/50"
          >
            Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search catalog offerings..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-48 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-2.5 px-3 outline-none"
          >
            <option value="">All Types</option>
            <option value="Service">Service</option>
            <option value="Physical">Physical</option>
            <option value="Digital">Digital</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex justify-center items-center p-12">
            <Spinner size="lg" color="blue" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex justify-center items-center py-12">
             <EmptyState 
                title="Catalog is Empty" 
                description="Unable to locate products. Adjust search patterns or create a new entry." 
                icon={Box} 
             />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  <th className="p-4 pl-6">Product Definition</th>
                  <th className="p-4">Type Class</th>
                  <th className="p-4 text-right">Base Price</th>
                  <th className="p-4 text-center">Variants Attached</th>
                  <th className="p-4 pr-6 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map(p => (
                  <tr 
                    key={p.id} 
                    onClick={() => handleRowClick(p.id)}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">ID: {p.id}</div>
                    </td>
                    <td className="p-4">
                      <TypeBadge type={p.productType} />
                    </td>
                    <td className="p-4 text-right font-medium text-slate-700">${Number(p.salesPrice).toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
                        {p.variants?.length || 0}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                       {isAdmin ? (
                         <div className="space-x-2 hidden sm:inline-flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => openEdit(e, p)} className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => openDelete(e, p.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all">
                                <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                       ) : (
                         <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-slate-600 transition-colors" />
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

      {isAdmin && (
        <>
          <ProductModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSave} 
            productToEdit={editingProduct} 
          />

          <ConfirmDialog 
            isOpen={isConfirmOpen} 
            title="Terminate Product Offering?" 
            message="Destroying this catalog item automatically orphans any variant linkages associated. Verify intention."
            onConfirm={confirmDelete}
            onCancel={() => setIsConfirmOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default Products;
