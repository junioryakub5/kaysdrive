import { useEffect, useState } from 'react';
import { adminApi as api, type Car, type Agent } from '../../services/adminApi';
import { ImageUpload } from '../../components/Shared/ImageUpload';
import { PageHeader } from '../../components/Dashboard/UI';

export default function Cars() {
    const [cars, setCars] = useState<Car[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCar, setEditingCar] = useState<Car | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Car | null>(null);

    const [form, setForm] = useState({
        title: '',
        slug: '',
        price: 0,
        priceType: 'fixed',
        status: 'sale',
        category: '',
        manufacturer: '',
        year: new Date().getFullYear(),
        mileage: 0,
        engine: '',
        fuel: 'gasoline',
        transmission: 'automatic',
        city: '',
        description: '',
        agentId: '',
        images: [''],
        features: [''],
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [carsData, agentsData] = await Promise.all([api.getCars(), api.getAgents()]);
        setCars(carsData);
        setAgents(agentsData);
        setLoading(false);
    };

    const openModal = (car?: Car) => {
        if (car) {
            setEditingCar(car);
            setForm({
                title: car.title,
                slug: car.slug,
                price: car.price,
                priceType: car.priceType,
                status: car.status,
                category: car.category,
                manufacturer: car.manufacturer,
                year: car.year,
                mileage: car.mileage,
                engine: car.engine,
                fuel: car.fuel,
                transmission: car.transmission,
                city: car.city,
                description: car.description,
                agentId: car.agentId,
                images: car.images.length ? car.images : [''],
                features: car.features.length ? car.features : [''],
            });
        } else {
            setEditingCar(null);
            setForm({
                title: '', slug: '', price: 0, priceType: 'fixed', status: 'sale',
                category: '', manufacturer: '', year: new Date().getFullYear(), mileage: 0,
                engine: '', fuel: 'gasoline', transmission: 'automatic', city: '',
                description: '', agentId: agents[0]?.id || '', images: [''], features: [''],
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...form,
            images: form.images.filter(i => i.trim()),
            features: form.features.filter(f => f.trim()),
        };

        if (editingCar) {
            await api.updateCar(editingCar.id, data);
        } else {
            await api.createCar(data);
        }

        setShowModal(false);
        loadData();
    };

    const handleDelete = async (car: Car) => {
        setDeleteConfirm(car);
    };

    const confirmDelete = async () => {
        if (deleteConfirm) {
            await api.deleteCar(deleteConfirm.id);
            setDeleteConfirm(null);
            loadData();
        }
    };

    const handleTogglePublish = async (id: string) => {
        await api.togglePublish(id);
        loadData();
    };

    const handleToggleFeatured = async (id: string) => {
        await api.toggleFeatured(id);
        loadData();
    };

    if (loading) return <div className="loading"><div className="spinner" /></div>;

    return (
        <div>
            <PageHeader
                title="Cars"
                subtitle="Manage your car inventory"
                actions={
                    <button className="btn btn-primary" onClick={() => openModal()}>+ Add Car</button>
                }
            />

            {/* Desktop Table View */}
            <div className="table-wrapper desktop-only">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Car</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Published</th>
                            <th>Featured</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cars.map(car => (
                            <tr key={car.id}>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <img src={car.images[0]} alt={car.title} className="car-thumbnail" style={{ width: '60px', height: '40px' }} />
                                        <div>
                                            <strong>{car.title}</strong>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {car.manufacturer} • {car.year}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    ${car.price.toLocaleString()}
                                    {car.priceType !== 'FIXED' && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> /{car.priceType.replace('PER_', '').toLowerCase()}</span>}
                                </td>
                                <td>
                                    <span className={`badge ${car.status === 'SALE' ? 'badge-success' : 'badge-info'}`}>
                                        {car.status}
                                    </span>
                                </td>
                                <td>
                                    <button className={`toggle ${car.isPublished ? 'active' : ''}`} onClick={() => handleTogglePublish(car.id)} />
                                </td>
                                <td>
                                    <button className={`toggle ${car.isFeatured ? 'active' : ''}`} onClick={() => handleToggleFeatured(car.id)} />
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn btn-sm btn-outline" onClick={() => openModal(car)}>
                                            Edit
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(car)}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-only">
                <div className="car-cards-grid">
                    {cars.map(car => (
                        <div key={car.id} className="car-card-mobile">
                            <div className="car-card-header">
                                <img src={car.images[0]} alt={car.title} className="car-card-image" />
                                <div className="car-card-info">
                                    <h4 className="car-card-title">{car.title}</h4>
                                    <p className="car-card-meta">{car.manufacturer} • {car.year}</p>
                                    <p className="car-card-price">
                                        ${car.price.toLocaleString()}
                                        {car.priceType !== 'FIXED' && <span> /{car.priceType.replace('PER_', '').toLowerCase()}</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="car-card-footer">
                                <div className="car-card-toggles">
                                    <label className="toggle-label">
                                        <span>Published</span>
                                        <button className={`toggle ${car.isPublished ? 'active' : ''}`} onClick={() => handleTogglePublish(car.id)} />
                                    </label>
                                    <label className="toggle-label">
                                        <span>Featured</span>
                                        <button className={`toggle ${car.isFeatured ? 'active' : ''}`} onClick={() => handleToggleFeatured(car.id)} />
                                    </label>
                                </div>
                                <div className="car-card-actions">
                                    <span className={`badge ${car.status === 'SALE' ? 'badge-success' : 'badge-info'}`}>{car.status}</span>
                                    <button className="action-btn" onClick={() => openModal(car)}>✏️</button>
                                    <button className="action-btn danger" onClick={() => handleDelete(car)}>🗑️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingCar ? 'Edit Car' : 'Add New Car'}</h3>
                            <button className="action-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Title</label>
                                        <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Slug</label>
                                        <input className="form-input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Price</label>
                                        <input type="number" className="form-input" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Price Type</label>
                                        <select className="form-select" value={form.priceType} onChange={e => setForm({ ...form, priceType: e.target.value })}>
                                            <option value="fixed">Fixed</option>
                                            <option value="per_week">Per Week</option>
                                            <option value="per_month">Per Month</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                            <option value="sale">For Sale</option>
                                            <option value="rent">For Rent</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <input className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Manufacturer</label>
                                        <input className="form-input" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Year</label>
                                        <input type="number" className="form-input" value={form.year} onChange={e => setForm({ ...form, year: +e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Mileage</label>
                                        <input type="number" className="form-input" value={form.mileage} onChange={e => setForm({ ...form, mileage: +e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Engine</label>
                                        <input className="form-input" value={form.engine} onChange={e => setForm({ ...form, engine: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Fuel</label>
                                        <select className="form-select" value={form.fuel} onChange={e => setForm({ ...form, fuel: e.target.value })}>
                                            <option value="gasoline">Gasoline</option>
                                            <option value="diesel">Diesel</option>
                                            <option value="electric">Electric</option>
                                            <option value="hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Transmission</label>
                                        <select className="form-select" value={form.transmission} onChange={e => setForm({ ...form, transmission: e.target.value })}>
                                            <option value="automatic">Automatic</option>
                                            <option value="manual">Manual</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Agent</label>
                                        <select className="form-select" value={form.agentId} onChange={e => setForm({ ...form, agentId: e.target.value })} required>
                                            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Car Images</label>
                                    <ImageUpload
                                        images={form.images.filter(Boolean)}
                                        onChange={(urls) => setForm({ ...form, images: urls })}
                                        maxImages={8}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Features (one per line)</label>
                                    <textarea className="form-textarea" value={form.features.join('\n')} onChange={e => setForm({ ...form, features: e.target.value.split('\n') })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingCar ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Confirm Delete</h3>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
