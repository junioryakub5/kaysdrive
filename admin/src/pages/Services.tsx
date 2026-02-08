import { useEffect, useState } from 'react';
import { api, type Service } from '../api';

export default function Services() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const [form, setForm] = useState({
        title: '',
        description: '',
        icon: '',
        features: [''],
        sortOrder: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await api.getServices();
        setServices(data);
        setLoading(false);
    };

    const openModal = (service?: Service) => {
        if (service) {
            setEditingService(service);
            setForm({
                title: service.title,
                description: service.description,
                icon: service.icon,
                features: service.features.length ? service.features : [''],
                sortOrder: service.sortOrder,
            });
        } else {
            setEditingService(null);
            setForm({ title: '', description: '', icon: '', features: [''], sortOrder: 0 });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { ...form, features: form.features.filter(f => f.trim()) };
        if (editingService) {
            await api.updateService(editingService.id, data);
        } else {
            await api.createService(data);
        }
        setShowModal(false);
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure?')) {
            await api.deleteService(id);
            loadData();
        }
    };

    if (loading) return <div className="loading"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">Services</h1>
                    <p className="page-subtitle">Manage your services</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>+ Add Service</button>
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Icon</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Features</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service.id}>
                                    <td style={{ fontSize: '1.5rem' }}>{service.icon === 'engine' ? '⚙️' : service.icon === 'wheel' ? '🔧' : service.icon === 'tools' ? '🛠️' : service.icon === 'shield' ? '🛡️' : service.icon === 'dollar' ? '💵' : '✨'}</td>
                                    <td><strong>{service.title}</strong></td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.description}</td>
                                    <td>{service.features.length}</td>
                                    <td><span className={`badge ${service.isActive ? 'badge-success' : 'badge-danger'}`}>{service.isActive ? 'Active' : 'Inactive'}</span></td>
                                    <td>
                                        <div className="actions">
                                            <button className="action-btn" onClick={() => openModal(service)}>✏️</button>
                                            <button className="action-btn danger" onClick={() => handleDelete(service.id)}>🗑️</button>
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
                            <h3 className="modal-title">{editingService ? 'Edit Service' : 'Add Service'}</h3>
                            <button className="action-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Icon (engine, wheel, tools, shield, dollar, sparkle)</label>
                                    <input className="form-input" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Features (one per line)</label>
                                    <textarea className="form-textarea" value={form.features.join('\n')} onChange={e => setForm({ ...form, features: e.target.value.split('\n') })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Sort Order</label>
                                    <input type="number" className="form-input" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: +e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingService ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
