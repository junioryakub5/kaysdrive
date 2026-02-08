import { useEffect, useState } from 'react';
import "../../components/Admin/AdminDashboard.css";
import { adminApi as api, type Service } from '../../services/adminApi';

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
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="dashboard-title">Services</h1>
                    <p className="dashboard-subtitle">Manage your services</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => openModal()}>+ Add Service</button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="dashboard-card desktop-only">
                <div className="table-wrapper">
                    <table className="data-table">
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

            {/* Mobile Card View */}
            <div className="mobile-only">
                <div className="car-cards-grid">
                    {services.map(service => (
                        <div key={service.id} className="car-card-mobile">
                            <div className="car-card-header">
                                <div style={{ fontSize: '2rem', marginRight: '1rem' }}>
                                    {service.icon === 'engine' ? '⚙️' : service.icon === 'wheel' ? '🔧' : service.icon === 'tools' ? '🛠️' : service.icon === 'shield' ? '🛡️' : service.icon === 'dollar' ? '💵' : '✨'}
                                </div>
                                <div className="car-card-info">
                                    <h4 className="car-card-title">{service.title}</h4>
                                    <p className="car-card-meta" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {service.description}
                                    </p>
                                    <p className="car-card-price">{service.features.length} features</p>
                                </div>
                            </div>
                            <div className="car-card-footer">
                                <div className="car-card-badges">
                                    <span className={`badge ${service.isActive ? 'badge-success' : 'badge-danger'}`}>
                                        {service.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="car-card-actions">
                                    <button className="action-btn" onClick={() => openModal(service)}>✏️</button>
                                    <button className="action-btn danger" onClick={() => handleDelete(service.id)}>🗑️</button>
                                </div>
                            </div>
                        </div>
                    ))}
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
