import { useEffect, useState } from 'react';
import { adminStoreApi } from '../../services/adminApi';
import { PageHeader, Modal, ConfirmDialog, SearchBar, StatusBadge } from '../../components/Dashboard/UI';
import type { ProductCategory } from '../../types';

type FormState = {
    name: string;
    description: string;
    image: string;
    sortOrder: string;
    isActive: boolean;
};

const defaultForm = (): FormState => ({ name: '', description: '', image: '', sortOrder: '0', isActive: true });

export default function AdminCategories() {
    const [categories, setCategories] = useState<(ProductCategory & { productCount?: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCat, setEditingCat] = useState<ProductCategory | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<ProductCategory | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<FormState>(defaultForm());

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await adminStoreApi.getCategories();
        setCategories(data);
        setLoading(false);
    };

    const openModal = (cat?: ProductCategory) => {
        if (cat) {
            setEditingCat(cat);
            setForm({
                name: cat.name,
                description: cat.description || '',
                image: cat.image || '',
                sortOrder: String(cat.sortOrder),
                isActive: cat.isActive,
            });
        } else {
            setEditingCat(null);
            setForm(defaultForm());
        }
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingCat(null); setForm(defaultForm()); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) return;
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                description: form.description || null,
                image: form.image || null,
                sortOrder: parseInt(form.sortOrder) || 0,
                isActive: form.isActive,
            };
            if (editingCat) {
                await adminStoreApi.updateCategory(editingCat.id, payload);
            } else {
                await adminStoreApi.createCategory(payload);
            }
            await loadData();
            closeModal();
        } catch (err: any) {
            alert(err.message || 'Failed to save category');
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await adminStoreApi.deleteCategory(deleteConfirm.id);
            setDeleteConfirm(null);
            loadData();
        } catch (err: any) {
            alert(err.message || 'Failed to delete category — it may have products assigned.');
        }
    };

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="dashboard-page">
            <PageHeader
                title="Product Categories"
                subtitle={`${categories.length} ${categories.length === 1 ? 'category' : 'categories'}`}
                actions={
                    <button className="btn btn-primary" onClick={() => openModal()}>+ Add Category</button>
                }
            />

            <div className="dashboard-section">
                <SearchBar value={search} onChange={setSearch} placeholder="Search categories…" />
            </div>

            {loading ? (
                <div className="loading"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {search ? `No categories matching "${search}"` : 'No categories yet. Create your first category!'}
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Products</th>
                                <th>Sort Order</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(cat => (
                                <tr key={cat.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            {cat.image ? (
                                                <img src={cat.image} alt={cat.name} style={{ width: '36px', height: '36px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                                                    🏷️
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</div>
                                                {cat.description && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {cat.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>
                                        {(cat as any).productCount ?? '—'}
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{cat.sortOrder}</td>
                                    <td>
                                        <StatusBadge status={cat.isActive ? 'success' : 'neutral'}>
                                            {cat.isActive ? 'Active' : 'Inactive'}
                                        </StatusBadge>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="action-btn" onClick={() => openModal(cat)}>Edit</button>
                                            <button className="action-btn danger" onClick={() => setDeleteConfirm(cat)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title={editingCat ? 'Edit Category' : 'New Category'}
                footer={
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
                        <button className="btn btn-primary" form="cat-form" type="submit" disabled={saving}>
                            {saving ? 'Saving…' : editingCat ? 'Save Changes' : 'Create Category'}
                        </button>
                    </div>
                }
            >
                <form id="cat-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Category Name *</label>
                        <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Image URL</label>
                        <input className="form-input" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://…" />
                    </div>
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Sort Order</label>
                            <input type="number" className="form-input" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} min="0" />
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                                />
                                Active (visible to customers)
                            </label>
                        </div>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteConfirm}
                title="Delete Category"
                message={`Delete "${deleteConfirm?.name}"? Products in this category will remain but become uncategorized.`}
                confirmLabel="Delete"
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm(null)}
            />
        </div>
    );
}
