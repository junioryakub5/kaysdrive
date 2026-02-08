import { useEffect, useState } from 'react';
import "../../components/Agent/AgentDashboard.css";
import { useSearchParams } from 'react-router-dom';
import { agentApi as api, type Car } from '../../services/adminApi';
import { ImageUpload } from '../../components/Shared/ImageUpload';

export default function MyCars() {
    const [searchParams] = useSearchParams();
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(searchParams.get('add') === 'true');
    const [editingCar, setEditingCar] = useState<Car | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Car | null>(null);

    const [form, setForm] = useState({
        title: '',
        price: 0,
        priceType: 'fixed',
        status: 'foreign_used',
        category: '',
        manufacturer: '',
        year: new Date().getFullYear(),
        mileage: 0,
        engine: '',
        fuel: 'gasoline',
        transmission: 'automatic',
        city: '',
        description: '',
        images: [''],
        features: [''],
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const carsData = await api.getCars();
        setCars(carsData);
        setLoading(false);
    };

    const openModal = (car?: Car) => {
        if (car) {
            setEditingCar(car);
            setForm({
                title: car.title,
                price: car.price,
                priceType: car.priceType.toLowerCase(),
                status: car.status.toLowerCase(),
                category: car.category,
                manufacturer: car.manufacturer,
                year: car.year,
                mileage: car.mileage,
                engine: car.engine,
                fuel: car.fuel.toLowerCase(),
                transmission: car.transmission.toLowerCase(),
                city: car.city,
                description: car.description,
                images: car.images.length ? car.images : [''],
                features: car.features.length ? car.features : [''],
            });
        } else {
            setEditingCar(null);
            setForm({
                title: '', price: 0, priceType: 'fixed', status: 'foreign_used',
                category: '', manufacturer: '', year: new Date().getFullYear(), mileage: 0,
                engine: '', fuel: 'gasoline', transmission: 'automatic', city: '',
                description: '', images: [''], features: [''],
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

    const handleDelete = (car: Car) => {
        setDeleteConfirm(car);
    };

    const confirmDelete = async () => {
        if (deleteConfirm) {
            await api.deleteCar(deleteConfirm.id);
            setDeleteConfirm(null);
            loadData();
        }
    };

    if (loading) return <div className="loading"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="dashboard-title">My Cars</h1>
                    <p className="dashboard-subtitle">Manage your car listings</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => openModal()}>+ Add Car</button>
                </div>
            </div>

            {cars.length === 0 ? (
                <div className="dashboard-card">
                    <div className="empty-state">
                        <p>You haven't added any cars yet.</p>
                        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => openModal()}>
                            Add Your First Car
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="table-wrapper desktop-only">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Car</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Published</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cars.map(car => (
                                    <tr key={car.id}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <img src={car.images[0] || 'https://via.placeholder.com/40'} alt={car.title} className="car-thumbnail" style={{ width: '60px', height: '40px' }} />
                                                <div>
                                                    <strong>{car.title}</strong>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {car.manufacturer} • {car.year}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            ₵{car.price.toLocaleString()}
                                            {car.priceType !== 'FIXED' && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> /{car.priceType.replace('PER_', '').toLowerCase()}</span>}
                                        </td>
                                        <td>
                                            <span className={`badge ${car.status === 'FOREIGN_USED' ? 'badge-success' : 'badge-info'}`}>
                                                {car.status === 'FOREIGN_USED' ? 'FU' : 'GU'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${car.isPublished ? 'badge-success' : 'badge-warning'}`}>
                                                {car.isPublished ? 'Published' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions">
                                                <button className="action-btn" onClick={() => openModal(car)}>✏️</button>
                                                <button className="action-btn danger" onClick={() => handleDelete(car)}>🗑️</button>
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
                                        <img src={car.images[0] || 'https://via.placeholder.com/80'} alt={car.title} className="car-card-image" />
                                        <div className="car-card-info">
                                            <h4 className="car-card-title">{car.title}</h4>
                                            <p className="car-card-meta">{car.manufacturer} • {car.year}</p>
                                            <p className="car-card-price">
                                                ₵{car.price.toLocaleString()}
                                                {car.priceType !== 'FIXED' && <span> /{car.priceType.replace('PER_', '').toLowerCase()}</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="car-card-footer">
                                        <div className="car-card-toggles">
                                            <span className={`badge ${car.status === 'FOREIGN_USED' ? 'badge-success' : 'badge-info'}`}>{car.status === 'FOREIGN_USED' ? 'FU' : 'GU'}</span>
                                            <span className={`badge ${car.isPublished ? 'badge-success' : 'badge-warning'}`}>
                                                {car.isPublished ? 'Published' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="car-card-actions">
                                            <button className="action-btn" onClick={() => openModal(car)}>✏️</button>
                                            <button className="action-btn danger" onClick={() => handleDelete(car)}>🗑️</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

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
                                        <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Porsche 911 GT3" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Price</label>
                                        <input type="number" className="form-input" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} placeholder="Enter amount" required />
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
                                            <option value="foreign_used">Foreign Used</option>
                                            <option value="ghana_used">Ghana Used</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                                            <option value="">Select Type</option>
                                            <option value="Sedan">Sedan</option>
                                            <option value="Hatchback">Hatchback</option>
                                            <option value="SUV">SUV</option>
                                            <option value="Pick Up">Pick Up</option>
                                            <option value="Coupe">Coupe</option>
                                            <option value="Convertible">Convertible</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Manufacturer</label>
                                        <input className="form-input" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} placeholder="e.g. BMW, Toyota" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Year</label>
                                        <input type="number" className="form-input" value={form.year} onChange={e => setForm({ ...form, year: +e.target.value })} placeholder="e.g., 2024" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Mileage</label>
                                        <input type="number" className="form-input" value={form.mileage} onChange={e => setForm({ ...form, mileage: +e.target.value })} placeholder="e.g., 12000" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Engine</label>
                                        <input className="form-input" value={form.engine} onChange={e => setForm({ ...form, engine: e.target.value })} placeholder="e.g. 3.0L V6" required />
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
                                        <input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="e.g. New York" required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the vehicle's features, condition, and highlights..." required />
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
                                    <textarea className="form-textarea" value={form.features.join('\n')} onChange={e => setForm({ ...form, features: e.target.value.split('\n') })} placeholder="Leather seats&#10;Sunroof&#10;Navigation" />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingCar ? 'Update' : 'Submit for Review'}</button>
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
