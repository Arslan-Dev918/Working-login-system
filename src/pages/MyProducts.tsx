import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  Edit3,
  Filter,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  X
} from 'lucide-react';
import {
  createProduct,
  deleteProduct,
  filterProducts,
  getProducts,
  Product,
  ProductListParams,
  searchProducts,
  updateProduct
} from '../services/api';

const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'];
const GENRES = ['Action', 'RPG', 'Sports', 'Adventure', 'Simulation'];
const STATUSES: Product['status'][] = ['Available', 'Out of Stock', 'Hidden'];
const CONDITIONS = ['New', 'Used', 'Like New', 'Refurbished'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_low_high', label: 'Price Low to High' },
  { value: 'price_high_low', label: 'Price High to Low' },
  { value: 'alphabetical', label: 'Alphabetical' }
];

interface MyProductsProps {
  initialAdd?: boolean;
}

interface ProductFormState {
  name: string;
  category: string;
  brand: string;
  condition: string;
  price: string;
  discount_price: string;
  description: string;
  stock: string;
  platform: string;
  genre: string;
  status: Product['status'];
  image: File | null;
}

const emptyForm: ProductFormState = {
  name: '',
  category: '',
  brand: '',
  condition: 'New',
  price: '',
  discount_price: '',
  description: '',
  stock: '',
  platform: 'PC',
  genre: 'Action',
  status: 'Available',
  image: null
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function currency(value: number | null) {
  if (value === null) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function buildProductFormData(form: ProductFormState) {
  const data = new FormData();
  data.append('name', form.name);
  data.append('category', form.category);
  data.append('brand', form.brand);
  data.append('condition', form.condition);
  data.append('price', form.price);
  data.append('discount_price', form.discount_price);
  data.append('description', form.description);
  data.append('stock', form.stock);
  data.append('platform', form.platform);
  data.append('genre', form.genre);
  data.append('status', form.status);
  if (form.image) data.append('image', form.image);
  return data;
}

export const MyProducts: React.FC<MyProductsProps> = ({ initialAdd = false }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [filters, setFilters] = useState({
    category: '',
    platform: '',
    condition: '',
    status: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(initialAdd);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);

  const hasFilters = Boolean(filters.category || filters.platform || filters.condition || filters.status);
  const hasQuery = search.trim().length > 0;

  const imagePreview = useMemo(() => {
    if (form.image) return URL.createObjectURL(form.image);
    return editingProduct?.image || '';
  }, [form.image, editingProduct]);

  const loadProducts = async (targetPage = page) => {
    setLoading(true);
    setError('');
    try {
      const params: ProductListParams = {
        page: targetPage,
        sort,
        q: search.trim(),
        ...filters
      };
      const response = hasQuery
        ? await searchProducts(params)
        : hasFilters
          ? await filterProducts(params)
          : await getProducts(params);

      if (response.success) {
        setProducts(response.products || []);
        setTotalPages(Math.max(response.pagination?.totalPages || 1, 1));
        setPage(response.pagination?.page || targetPage);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Products load nahi ho sake.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1);
  }, [sort, filters.category, filters.platform, filters.condition, filters.status]);

  useEffect(() => {
    if (initialAdd) openCreateModal();
  }, [initialAdd]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError('');
    setMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      brand: product.brand,
      condition: product.condition,
      price: String(product.price),
      discount_price: product.discount_price === null ? '' : String(product.discount_price),
      description: product.description,
      stock: String(product.stock),
      platform: product.platform,
      genre: product.genre,
      status: product.status,
      image: null
    });
    setError('');
    setMessage('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (!editingProduct && !form.image) {
        setError('Product image is required.');
        return;
      }

      const data = buildProductFormData(form);
      const response = editingProduct
        ? await updateProduct(editingProduct.id, data)
        : await createProduct(data);

      if (response.success) {
        setMessage(response.message || 'Product saved successfully.');
        setIsModalOpen(false);
        setEditingProduct(null);
        setForm(emptyForm);
        await loadProducts(page);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Product save nahi ho saka.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await deleteProduct(deleteTarget.id);
      if (response.success) {
        setMessage(response.message || 'Product deleted successfully.');
        setDeleteTarget(null);
        await loadProducts(page);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Product delete nahi ho saka.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0A] text-[#F5F5F0] p-6 sm:p-10 lg:p-14">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
              <Boxes className="w-4 h-4" />
              <span>Seller Inventory</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif italic font-light text-white">My Products</h1>
            <p className="max-w-2xl text-sm text-white/50 font-mono">
              Manage product listings, stock, visibility, pricing, and images for your authenticated seller account.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-black hover:bg-[#E0E0E0] text-xs font-bold uppercase tracking-[0.2em] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>

        {(message || error) && (
          <div className={`p-4 border text-xs font-mono flex items-center justify-between ${
            error ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            <span>{error || message}</span>
            <button onClick={() => { setMessage(''); setError(''); }} className="text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          <section className="space-y-6">
            <div className="bg-[#0F0F0F] border border-white/10 p-4 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') loadProducts(1);
                  }}
                  placeholder="Search by product name, category, or brand"
                  className="w-full bg-[#1A1A1A] border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
                />
              </div>
              <button
                onClick={() => loadProducts(1)}
                className="px-5 py-3 border border-white/20 hover:bg-white hover:text-black text-xs font-bold uppercase tracking-[0.2em] transition-colors"
              >
                Search
              </button>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="bg-[#1A1A1A] border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="min-h-80 bg-[#0F0F0F] border border-white/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white/50" />
              </div>
            ) : products.length === 0 ? (
              <div className="min-h-80 bg-[#0F0F0F] border border-white/10 flex flex-col items-center justify-center text-center p-8">
                <Package className="w-10 h-10 text-white/30 mb-4" />
                <h2 className="text-2xl font-serif italic text-white">No products yet</h2>
                <p className="text-xs font-mono text-white/40 mt-2">Create your first product listing to start managing inventory.</p>
                <button
                  onClick={openCreateModal}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-white text-black text-xs font-bold uppercase tracking-[0.2em]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {products.map((product) => (
                  <article key={product.id} className="bg-[#0F0F0F] border border-white/10 overflow-hidden">
                    <div className="aspect-[16/10] bg-[#1A1A1A] border-b border-white/10">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30">
                          <ImagePlus className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">{product.category} / {product.platform}</p>
                          <h2 className="text-xl font-serif italic text-white mt-1">{product.name}</h2>
                          <p className="text-xs text-white/50 font-mono mt-1">{product.brand}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest border ${
                          product.status === 'Available'
                            ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
                            : product.status === 'Out of Stock'
                              ? 'border-amber-500/30 text-amber-300 bg-amber-500/10'
                              : 'border-white/20 text-white/50 bg-white/5'
                        }`}>
                          {product.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-3 bg-[#1A1A1A] border border-white/10">
                          <span className="block text-[9px] uppercase tracking-widest text-white/35">Price</span>
                          <span className="text-white font-semibold">{currency(product.discount_price ?? product.price)}</span>
                        </div>
                        <div className="p-3 bg-[#1A1A1A] border border-white/10">
                          <span className="block text-[9px] uppercase tracking-widest text-white/35">Stock</span>
                          <span className="text-white font-semibold">{product.stock}</span>
                        </div>
                        <div className="p-3 bg-[#1A1A1A] border border-white/10">
                          <span className="block text-[9px] uppercase tracking-widest text-white/35">Condition</span>
                          <span className="text-white/80">{product.condition}</span>
                        </div>
                        <div className="p-3 bg-[#1A1A1A] border border-white/10">
                          <span className="block text-[9px] uppercase tracking-widest text-white/35">Date</span>
                          <span className="text-white/80">{formatDate(product.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => openEditModal(product)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-white/20 hover:bg-white hover:text-black text-xs font-bold uppercase tracking-[0.2em] transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="inline-flex items-center justify-center px-4 py-3 border border-rose-500/30 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border border-white/10 bg-[#0F0F0F] p-4 text-xs font-mono text-white/50">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => loadProducts(page - 1)}
                  className="px-4 py-2 border border-white/10 disabled:opacity-30 hover:bg-white hover:text-black"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => loadProducts(page + 1)}
                  className="px-4 py-2 border border-white/10 disabled:opacity-30 hover:bg-white hover:text-black"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          <aside className="bg-[#0F0F0F] border border-white/10 p-5 h-fit space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-mono">Filters</span>
              <Filter className="w-4 h-4 text-white/40" />
            </div>
            <input
              value={filters.category}
              onChange={(event) => setFilters({ ...filters, category: event.target.value })}
              placeholder="Category"
              className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
            />
            <select value={filters.platform} onChange={(event) => setFilters({ ...filters, platform: event.target.value })} className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-3 text-xs text-white">
              <option value="">All Platforms</option>
              {PLATFORMS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={filters.condition} onChange={(event) => setFilters({ ...filters, condition: event.target.value })} className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-3 text-xs text-white">
              <option value="">All Conditions</option>
              {CONDITIONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-3 text-xs text-white">
              <option value="">All Statuses</option>
              {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button
              onClick={() => {
                setSearch('');
                setFilters({ category: '', platform: '', condition: '', status: '' });
                setSort('newest');
              }}
              className="w-full px-4 py-3 border border-white/20 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
            >
              Clear
            </button>
          </aside>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto my-8 bg-[#0F0F0F] border border-white/10">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">Product Editor</p>
                  <h2 className="text-3xl font-serif italic text-white mt-2">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 border border-white/10 hover:bg-white hover:text-black">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product Name" className="bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30" />
                <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30" />
                <input required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Brand" className="bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30" />
                <select required value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white">
                  {CONDITIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <input required min="0" step="0.01" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className="bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30" />
                <input min="0" step="0.01" type="number" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} placeholder="Discount Price (optional)" className="bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30" />
                <input required min="0" step="1" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock Quantity" className="bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30" />
                <select required value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white">
                  {PLATFORMS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select required value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white">
                  {GENRES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select required value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Product['status'] })} className="bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white">
                  {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              <textarea
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description"
                rows={4}
                className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30"
              />

              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-center">
                <div className="aspect-square bg-[#1A1A1A] border border-white/10 overflow-hidden flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Product preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus className="w-8 h-8 text-white/30" />
                  )}
                </div>
                <label className="block">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">Product Image jpg, jpeg, png, webp up to 5MB</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                    className="mt-3 block w-full text-xs text-white/60 file:mr-4 file:border-0 file:bg-white file:text-black file:px-4 file:py-3 file:text-xs file:font-bold file:uppercase file:tracking-[0.2em]"
                  />
                </label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 border border-white/20 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black">
                  Cancel
                </button>
                <button disabled={saving} type="submit" className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingProduct ? 'Save Product' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="max-w-md w-full bg-[#0F0F0F] border border-white/10 p-6 space-y-5">
            <div className="flex items-center gap-3 text-rose-300">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-2xl font-serif italic text-white">Delete product?</h2>
            </div>
            <p className="text-sm text-white/50 font-mono">
              This will permanently delete "{deleteTarget.name}" and remove its product image from uploads.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-3 border border-white/20 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black">
                Cancel
              </button>
              <button disabled={saving} onClick={confirmDelete} className="px-4 py-3 bg-rose-500 text-white text-xs font-bold uppercase tracking-[0.2em] disabled:opacity-50">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
