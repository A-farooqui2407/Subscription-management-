import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { productsApi } from '../api/products';
import VariantRow from '../components/VariantRow';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import { ArrowLeft, Plus, Box, Layers } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const toast = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Handlers map for VariantRow creation mock
  const [isCreatingVariant, setIsCreatingVariant] = useState(false);
  const [tempVariantId, setTempVariantId] = useState(-1);
  
  const [deleteVariantId, setDeleteVariantId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsApi.getProductById(id);
      setProduct(data);
    } catch (e) {
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);


  const handleSaveVariant = async (variantData) => {
    try {
      if (!variantData.id || variantData.id < 0) {
        await productsApi.createVariant(id, {
          attribute: variantData.attribute,
          value: variantData.value,
          extraPrice: variantData.extraPrice,
        });
        toast.success("Variant rule added.");
        setIsCreatingVariant(false);
      } else {
        await productsApi.updateVariant(id, variantData.id, variantData);
        toast.success("Variant explicitly modified.");
      }
      fetchDetail();
    } catch (e) {
      toast.error("Failed to commit variant changes.");
    }
  };

  const handleCreateCancel = (v) => {
    // If it was a mock new row, just close creation
    setIsCreatingVariant(false);
  };

  const confirmDelete = async () => {
    try {
      await productsApi.deleteVariant(id, deleteVariantId);
      toast.success("Variant block dropped.");
      setIsConfirmOpen(false);
      fetchDetail();
    } catch (e) {
      toast.error("Error executing variant split.");
    }
  };

  const openDelete = (variant) => {
    setDeleteVariantId(variant.id);
    setIsConfirmOpen(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center p-24">
        <Spinner size="lg" color="slate" />
      </div>
    );
  }

  if (!product) {
    return <div className="p-8 text-center text-slate-500 font-medium">Product configuration not found.</div>;
  }

  const dummyNewVariant = { id: tempVariantId, attribute: '', value: '', extraPrice: 0 };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <Link to="/products" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 flex-shrink-0">
                  <Box className="w-8 h-8" />
              </div>
              <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{product.name}</h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 font-medium">
                      <span className="font-mono bg-slate-100 px-2 rounded tracking-wide text-[11px] uppercase">ID: {product.id}</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {product.type} Setup</span>
                  </div>
              </div>
           </div>
           
           <div className="flex gap-8 text-right md:pr-4">
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Base Logic Cost</p>
                 <p className="text-2xl font-black text-slate-800">${Number(product.costPrice).toFixed(2)}</p>
              </div>
              <div>
                 <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Client Sales Price</p>
                 <p className="text-2xl font-black text-indigo-600">${Number(product.salesPrice).toFixed(2)}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Variants Sub-panel */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
           <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl font-bold text-slate-800">Operational Variants</h2>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">{product.variants?.length || 0}</span>
           </div>
           {isAdmin && (
             <button 
               onClick={() => setIsCreatingVariant(true)}
               disabled={isCreatingVariant}
               className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm focus:ring-2 flex text-sm items-center gap-2"
             >
               <Plus className="w-4 h-4" /> Add Variant
             </button>
           )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="p-3 pl-6">Config Attribute</th>
                <th className="p-3">Matched Value Constraint</th>
                <th className="p-3">Differential Upcharge / Discount</th>
                <th className="p-3 pr-6 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 bg-white">
               {product.variants?.map(v => (
                 <VariantRow 
                   key={v.id} 
                   variant={v} 
                   isAdmin={isAdmin}
                   onSave={handleSaveVariant}
                   onDelete={() => openDelete(v)}
                 />
               ))}
               {isCreatingVariant && isAdmin && (
                 <VariantRow 
                   key={dummyNewVariant.id} 
                   variant={dummyNewVariant} 
                   isAdmin={isAdmin}
                   onSave={handleSaveVariant}
                   onDelete={handleCreateCancel}
                 />
               )}
            </tbody>
          </table>
          {(!product.variants || product.variants.length === 0) && !isCreatingVariant && (
             <div className="p-12 text-center text-slate-400 text-sm font-medium">
                No advanced logical variants specified for this product scope.
             </div>
          )}
        </div>
      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        title="Destroy Inline Variant Configuration?" 
        message="Dropping this differential affects all downstream pricing mechanisms pointing to this product mapping. Ensure logic permits."
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default ProductDetail;
