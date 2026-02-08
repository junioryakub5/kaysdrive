import { useEffect, useState } from 'react';
import { api, type FAQ } from '../api';

export default function FAQs() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

    const [form, setForm] = useState({
        question: '',
        answer: '',
        category: '',
        sortOrder: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await api.getFAQs();
        setFaqs(data);
        setLoading(false);
    };

    const openModal = (faq?: FAQ) => {
        if (faq) {
            setEditingFaq(faq);
            setForm({
                question: faq.question,
                answer: faq.answer,
                category: faq.category || '',
                sortOrder: faq.sortOrder,
            });
        } else {
            setEditingFaq(null);
            setForm({ question: '', answer: '', category: '', sortOrder: 0 });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingFaq) {
            await api.updateFAQ(editingFaq.id, form);
        } else {
            await api.createFAQ(form);
        }
        setShowModal(false);
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure?')) {
            await api.deleteFAQ(id);
            loadData();
        }
    };

    if (loading) return <div className="loading"><div className="spinner" /></div>;

    const categories = [...new Set(faqs.map(f => f.category).filter(Boolean))];

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">FAQs</h1>
                    <p className="page-subtitle">Manage frequently asked questions</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>+ Add FAQ</button>
            </div>

            {categories.length > 0 && (
                <div className="filters">
                    {categories.map(cat => (
                        <span key={cat} className="badge badge-primary">{cat}</span>
                    ))}
                </div>
            )}

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faqs.map(faq => (
                                <tr key={faq.id}>
                                    <td>
                                        <strong>{faq.question}</strong>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {faq.answer}
                                        </div>
                                    </td>
                                    <td><span className="badge badge-primary">{faq.category || 'General'}</span></td>
                                    <td><span className={`badge ${faq.isActive ? 'badge-success' : 'badge-danger'}`}>{faq.isActive ? 'Active' : 'Inactive'}</span></td>
                                    <td>
                                        <div className="actions">
                                            <button className="action-btn" onClick={() => openModal(faq)}>✏️</button>
                                            <button className="action-btn danger" onClick={() => handleDelete(faq.id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</h3>
                            <button className="action-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Question</label>
                                    <input className="form-input" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Answer</label>
                                    <textarea className="form-textarea" value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <input className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. purchases, rentals, financing" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Sort Order</label>
                                    <input type="number" className="form-input" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: +e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingFaq ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
