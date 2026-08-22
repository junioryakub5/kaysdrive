import { useEffect, useState } from 'react';
import { adminStoreApi } from '../../services/adminApi';
import { ImageUpload } from '../../components/Shared/ImageUpload';
import { PageHeader, Modal, ConfirmDialog, SearchBar, StatusBadge, getStatusType } from '../../components/Dashboard/UI';
import type { Product, ProductCategory } from '../../types';
import { formatPrice } from '../../utils/format';

const UPLOAD_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/upload/products/multiple`;

// Custom upload for products (uses /upload/products/multiple endpoint)
const uploadProductImages = async (files: FileList | File[]): Promise<string[]> => {
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));
    const token = localStorage.getItem('admin_token');
    const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
    });
    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.urls;
};

type FormState = {
    name: string;
    shortDescription: string;
    description: string;
    categoryId: string;
    price: string;
    discountPrice: string;
    sku: string;
    stock: string;
    images: string[];
    isAvailable: boolean;
    isFeatured: boolean;
    isPublished: boolean;
    brand: string;
    warranty: string;
    whatsIncluded: string;
    condition: string;
    tags: string;
    specifications: string;
    compatibility: string;
    lowStockThreshold: string;
    isNewArrival: boolean;
};

const defaultForm = (): FormState => ({
    name: '', shortDescription: '', description: '',
    categoryId: '', price: '', discountPrice: '', sku: '',
    stock: '0', images: [],
    isAvailable: true, isFeatured: false, isPublished: true,
    brand: '', warranty: '', whatsIncluded: '', condition: 'NEW',
    tags: '', specifications: '', compatibility: '',
    lowStockThreshold: '5', isNewArrival: true,
});

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<FormState>(defaultForm());

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [prodData, catData] = await Promise.all([
                adminStoreApi.getProducts({ limit: 100 }),
                adminStoreApi.getCategories(),
            ]);
            setProducts(prodData.products);
            setCategories(catData);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setForm({
                name: product.name,
                shortDescription: product.shortDescription || '',
                description: product.description,
                categoryId: product.categoryId || '',
                price: String(product.price),
                discountPrice: String(product.discountPrice || ''),
                sku: product.sku || '',
                stock: String(product.stock),
                images: product.images || [],
                isAvailable: product.isAvailable,
                isFeatured: product.isFeatured,
                isPublished: product.isPublished,
                brand: product.brand || '',
                warranty: product.warranty || '',
                whatsIncluded: product.whatsIncluded || '',
                condition: product.condition || 'NEW',
                tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
                specifications: '',
                compatibility: Array.isArray(product.compatibility) ? product.compatibility.join(', ') : '',
                lowStockThreshold: String(product.lowStockThreshold || 5),
                isNewArrival: product.isNewArrival ?? true,
            });
        } else {
            setEditingProduct(null);
            setForm(defaultForm());
        }
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingProduct(null); setForm(defaultForm()); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.description || !form.price) return;
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                shortDescription: form.shortDescription || null,
                description: form.description,
                categoryId: form.categoryId || null,
                price: parseFloat(form.price),
                discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
                sku: form.sku || null,
                stock: parseInt(form.stock) || 0,
                images: form.images,
                isAvailable: form.isAvailable,
                isFeatured: form.isFeatured,
                isPublished: form.isPublished,
                brand: form.brand || null,
                warranty: form.warranty || null,
                whatsIncluded: form.whatsIncluded || null,
                condition: form.condition,
                tags: JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)),
                specifications: form.specifications || '[]',
                compatibility: JSON.stringify(form.compatibility.split(',').map(t => t.trim()).filter(Boolean)),
                lowStockThreshold: parseInt(form.lowStockThreshold) || 5,
                isNewArrival: form.isNewArrival,
            };
            if (editingProduct) {
                await adminStoreApi.updateProduct(editingProduct.id, payload);
            } else {
                await adminStoreApi.createProduct(payload);
            }
            await loadData();
            closeModal();
        } catch (err: any) {
            alert(err.message || 'Failed to save product');
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        await adminStoreApi.deleteProduct(deleteConfirm.id);
        setDeleteConfirm(null);
        loadData();
    };

    const togglePublish = async (p: Product) => {
        await adminStoreApi.togglePublish(p.id);
        loadData();
    };

    const toggleFeature = async (p: Product) => {
        await adminStoreApi.toggleFeature(p.id);
        loadData();
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="dashboard-page">
            <PageHeader
                title="Products"
                subtitle={`${products.length} product${products.length !== 1 ? 's' : ''}`}
                actions={
                    <button className="btn btn-primary" onClick={() => openModal()}>+ Add Product</button>
                }
            />

            <div className="dashboard-section">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by name or SKU…"
                />
            </div>

            {loading ? (
                <div className="loading"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {search ? `No products matching "${search}"` : 'No products yet. Add your first product!'}
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Brand</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '0.5rem',
                                                overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0,
                                            }}>
                                                {p.images?.[0] ? (
                                                    <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📦</div>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                                                {p.sku && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {p.sku}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                        {p.brand || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                        {p.category?.name || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{formatPrice(p.price)}</div>
                                        {p.discountPrice && (
                                            <div style={{ fontSize: '0.75rem', color: '#22c55e' }}>{formatPrice(p.discountPrice)} (sale)</div>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{
                                            fontWeight: 600,
                                            color: p.stock === 0 ? '#ef4444' : p.stock < 5 ? '#f59e0b' : 'var(--text-primary)',
                                        }}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <StatusBadge status={p.isPublished ? 'success' : 'neutral'}>{p.isPublished ? 'Published' : 'Draft'}</StatusBadge>
                                            {p.isFeatured && <StatusBadge status="info">Featured</StatusBadge>}
                                            {!p.isAvailable && <StatusBadge status="warning">Unavailable</StatusBadge>}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button className="action-btn" onClick={() => openModal(p)}>Edit</button>
                                            <button className="action-btn" onClick={() => togglePublish(p)}>
                                                {p.isPublished ? 'Unpublish' : 'Publish'}
                                            </button>
                                            <button className="action-btn" onClick={() => toggleFeature(p)}>
                                                {p.isFeatured ? 'Unfeature' : 'Feature'}
                                            </button>
                                            <button className="action-btn danger" onClick={() => setDeleteConfirm(p)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Product Form Modal */}
            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
                size="lg"
                footer={
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
                        <button className="btn btn-primary" form="product-form" type="submit" disabled={saving}>
                            {saving ? 'Saving…' : editingProduct ? 'Save Changes' : 'Create Product'}
                        </button>
                    </div>
                }
            >
                <form id="product-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Product Name *</label>
                            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">SKU</label>
                            <input className="form-input" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="Optional" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Short Description</label>
                        <input className="form-input" value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} placeholder="Brief one-line description" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Full Description *</label>
                        <textarea className="form-textarea" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-select" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                                <option value="">— No category —</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Stock</label>
                            <input type="number" className="form-input" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} min="0" />
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Price (GHS) *</label>
                            <input type="number" step="0.01" className="form-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Discount Price (GHS)</label>
                            <input type="number" step="0.01" className="form-input" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))} placeholder="Leave blank for no discount" />
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Brand</label>
                            <input className="form-input" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="e.g. TOPDON, ANCEL" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Condition</label>
                            <select className="form-select" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
                                <option value="NEW">NEW</option>
                                <option value="REFURBISHED">REFURBISHED</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Warranty</label>
                            <input className="form-input" value={form.warranty} onChange={e => setForm(f => ({ ...f, warranty: e.target.value }))} placeholder="e.g. 1 Year Manufacturer Warranty" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Low Stock Threshold</label>
                            <input type="number" className="form-input" value={form.lowStockThreshold} onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))} min="0" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">What's Included</label>
                        <textarea className="form-textarea" rows={2} value={form.whatsIncluded} onChange={e => setForm(f => ({ ...f, whatsIncluded: e.target.value }))} placeholder="e.g. 1x Scanner, 1x USB Cable..." />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tags</label>
                        <input className="form-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Comma separated: obd2, diagnostic, scanner" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Product Images</label>
                        <ImageUpload
                            images={form.images}
                            onChange={imgs => setForm(f => ({ ...f, images: imgs }))}
                            maxImages={10}
                            uploadUrl={UPLOAD_URL}
                            token={localStorage.getItem('admin_token')}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {[
                            { key: 'isPublished', label: 'Published (visible to customers)' },
                            { key: 'isAvailable', label: 'Available for purchase' },
                            { key: 'isFeatured', label: 'Featured on store homepage' },
                            { key: 'isNewArrival', label: 'New Arrival' },
                        ].map(({ key, label }) => (
                            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                                <input
                                    type="checkbox"
                                    checked={form[key as keyof FormState] as boolean}
                                    onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteConfirm}
                title="Delete Product"
                message={`Are you sure you want to delete "${deleteConfirm?.name}"? This cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm(null)}
            />
        </div>
    );
}
