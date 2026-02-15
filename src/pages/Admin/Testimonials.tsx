import { useEffect, useState, useRef } from 'react';
import "../../components/Admin/AdminDashboard.css";
import { adminApi as api, type Testimonial } from '../../services/adminApi';

// Default user icon SVG
const UserIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
    </svg>
);

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [uploading, setUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        name: '',
        role: '',
        avatar: '',
        content: '',
        rating: 5,
        isActive: true,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await api.getTestimonials();
        setTestimonials(data);
        setLoading(false);
    };

    const openModal = (testimonial?: Testimonial) => {
        if (testimonial) {
            setEditingTestimonial(testimonial);
            setForm({
                name: testimonial.name,
                role: testimonial.role,
                avatar: testimonial.avatar || '',
                content: testimonial.content,
                rating: testimonial.rating,
                isActive: testimonial.isActive,
            });
            setAvatarPreview(testimonial.avatar || '');
        } else {
            setEditingTestimonial(null);
            setForm({ name: '', role: '', avatar: '', content: '', rating: 5, isActive: true });
            setAvatarPreview('');
        }
        setShowModal(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/upload/single`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            // Cloudinary returns absolute URLs, don't prepend backend URL
            let imageUrl = data.url;
            if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${imageUrl}`;
            }

            setForm({ ...form, avatar: imageUrl });
            setAvatarPreview(imageUrl);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTestimonial) {
            await api.updateTestimonial(editingTestimonial.id, form);
        } else {
            await api.createTestimonial(form);
        }
        setShowModal(false);
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this testimonial?')) {
            await api.deleteTestimonial(id);
            loadData();
        }
    };

    const toggleActive = async (testimonial: Testimonial) => {
        await api.updateTestimonial(testimonial.id, { ...testimonial, isActive: !testimonial.isActive });
        loadData();
    };

    if (loading) return <div className="loading"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="dashboard-title">Testimonials</h1>
                    <p className="dashboard-subtitle">Manage client testimonials</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => openModal()}>+ Add Testimonial</button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="dashboard-card desktop-only">
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Avatar</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Content</th>
                                <th>Rating</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testimonials.map(testimonial => (
                                <tr key={testimonial.id}>
                                    <td>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            backgroundColor: '#e0e0e0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#757575'
                                        }}>
                                            {testimonial.avatar ? (
                                                <img
                                                    src={testimonial.avatar}
                                                    alt={testimonial.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <UserIcon />
                                            )}
                                        </div>
                                    </td>
                                    <td><strong>{testimonial.name}</strong></td>
                                    <td>{testimonial.role}</td>
                                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        "{testimonial.content}"
                                    </td>
                                    <td>
                                        <span style={{ color: '#f59e0b' }}>
                                            {'⭐'.repeat(testimonial.rating)}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => toggleActive(testimonial)}
                                            className={`badge ${testimonial.isActive ? 'badge-success' : 'badge-danger'}`}
                                            style={{ cursor: 'pointer', border: 'none', padding: '4px 12px' }}
                                        >
                                            {testimonial.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button className="action-btn" onClick={() => openModal(testimonial)}>✏️</button>
                                            <button className="action-btn danger" onClick={() => handleDelete(testimonial.id)}>🗑️</button>
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
                    {testimonials.map(testimonial => (
                        <div key={testimonial.id} className="car-card-mobile">
                            <div className="car-card-header">
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    marginRight: '1rem',
                                    backgroundColor: '#e0e0e0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#757575',
                                    flexShrink: 0
                                }}>
                                    {testimonial.avatar ? (
                                        <img
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <UserIcon />
                                    )}
                                </div>
                                <div className="car-card-info">
                                    <h4 className="car-card-title">{testimonial.name}</h4>
                                    <p className="car-card-meta">{testimonial.role}</p>
                                    <p className="car-card-price" style={{ color: '#f59e0b' }}>
                                        {'⭐'.repeat(testimonial.rating)}
                                    </p>
                                </div>
                            </div>
                            <p style={{ padding: '0.5rem 1rem', color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                "{testimonial.content.substring(0, 100)}{testimonial.content.length > 100 ? '...' : ''}"
                            </p>
                            <div className="car-card-footer">
                                <div className="car-card-badges">
                                    <button
                                        onClick={() => toggleActive(testimonial)}
                                        className={`badge ${testimonial.isActive ? 'badge-success' : 'badge-danger'}`}
                                        style={{ cursor: 'pointer', border: 'none' }}
                                    >
                                        {testimonial.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </div>
                                <div className="car-card-actions">
                                    <button className="action-btn" onClick={() => openModal(testimonial)}>✏️</button>
                                    <button className="action-btn danger" onClick={() => handleDelete(testimonial.id)}>🗑️</button>
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
                            <h3 className="modal-title">{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
                            <button className="action-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Name *</label>
                                    <input
                                        className="form-input"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g., Sarah Williams"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role/Title *</label>
                                    <input
                                        className="form-input"
                                        value={form.role}
                                        onChange={e => setForm({ ...form, role: e.target.value })}
                                        placeholder="e.g., Marketing Director"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Profile Picture</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {/* Avatar Preview */}
                                        <div style={{
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            backgroundColor: '#e0e0e0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#757575',
                                            border: '2px solid var(--border)',
                                            flexShrink: 0
                                        }}>
                                            {avatarPreview ? (
                                                <img
                                                    src={avatarPreview}
                                                    alt="Preview"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <UserIcon />
                                            )}
                                        </div>

                                        {/* Upload Controls */}
                                        <div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                style={{ display: 'none' }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                style={{ fontSize: '0.875rem' }}
                                            >
                                                {uploading ? 'Uploading...' : avatarPreview ? 'Change Photo' : 'Upload Photo'}
                                            </button>
                                            {avatarPreview && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setForm({ ...form, avatar: '' });
                                                        setAvatarPreview('');
                                                    }}
                                                    style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        Upload a profile picture (max 5MB) or leave empty to use default icon
                                    </p>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Testimonial Content *</label>
                                    <textarea
                                        className="form-textarea"
                                        value={form.content}
                                        onChange={e => setForm({ ...form, content: e.target.value })}
                                        placeholder="The client's testimonial quote..."
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Rating (1-5)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        className="form-input"
                                        value={form.rating}
                                        onChange={e => setForm({ ...form, rating: +e.target.value })}
                                    />
                                    <div style={{ marginTop: '0.5rem', color: '#f59e0b' }}>
                                        {'⭐'.repeat(form.rating)}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={form.isActive}
                                            onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                            style={{ width: 'auto' }}
                                        />
                                        Active (show on website)
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={uploading}>
                                    {uploading ? 'Uploading...' : editingTestimonial ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
