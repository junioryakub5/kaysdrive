import { useEffect, useState, useRef } from 'react';
import "../../components/Admin/AdminDashboard.css";
import { adminApi as api, type Agent } from '../../services/adminApi';

export default function Agents() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Agent | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        name: '',
        role: '',
        phone: '',
        email: '',
        avatar: '',
        bio: '',
        password: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await api.getAgents();
        setAgents(data);
        setLoading(false);
    };

    const openModal = (agent?: Agent) => {
        if (agent) {
            setEditingAgent(agent);
            setForm({
                name: agent.name,
                role: agent.role,
                phone: agent.phone,
                email: agent.email,
                avatar: agent.avatar || '',
                bio: agent.bio || '',
                password: '', // Don't show password on edit
            });
        } else {
            setEditingAgent(null);
            setForm({ name: '', role: '', phone: '', email: '', avatar: '', bio: '', password: '' });
        }
        setShowModal(true);
    };

    // Handle avatar upload
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('images', file);

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/upload/multiple`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            // Cloudinary returns absolute URLs, don't prepend backend URL
            let avatarUrl = data.urls[0];
            if (!avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
                avatarUrl = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${avatarUrl}`;
            }
            setForm({ ...form, avatar: avatarUrl });
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload avatar. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAgent) {
            await api.updateAgent(editingAgent.id, form);
        } else {
            await api.createAgent(form);
        }
        setShowModal(false);
        loadData();
    };

    const handleDelete = (agent: Agent) => {
        setDeleteConfirm(agent);
    };

    const confirmDelete = async () => {
        if (deleteConfirm) {
            await api.deleteAgent(deleteConfirm.id);
            setDeleteConfirm(null);
            loadData();
        }
    };

    if (loading) return <div className="loading"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="dashboard-title">Agents</h1>
                    <p className="dashboard-subtitle">Manage your sales team</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => openModal()}>+ Add Agent</button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="table-wrapper desktop-only">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Agent</th>
                            <th>Role</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agents.map(agent => (
                            <tr key={agent.id}>
                                <td>
                                    <div className="flex items-center gap-2">
                                        {agent.avatar && <img src={agent.avatar} alt={agent.name} className="avatar" />}
                                        <strong>{agent.name}</strong>
                                    </div>
                                </td>
                                <td>{agent.role}</td>
                                <td>{agent.phone}</td>
                                <td>{agent.email}</td>
                                <td>
                                    <span className={`badge ${agent.isActive ? 'badge-success' : 'badge-danger'}`}>
                                        {agent.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <div className="actions">
                                        <button className="action-btn" onClick={() => openModal(agent)}>✏️</button>
                                        <button className="action-btn danger" onClick={() => handleDelete(agent)}>🗑️</button>
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
                    {agents.map(agent => (
                        <div key={agent.id} className="car-card-mobile">
                            <div className="car-card-header">
                                {agent.avatar ? (
                                    <img src={agent.avatar} alt={agent.name} className="car-card-image" style={{ borderRadius: '50%' }} />
                                ) : (
                                    <div className="car-card-image" style={{ borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }}>
                                        {agent.name.charAt(0)}
                                    </div>
                                )}
                                <div className="car-card-info">
                                    <h4 className="car-card-title">{agent.name}</h4>
                                    <p className="car-card-meta">{agent.role}</p>
                                    <p className="car-card-meta">{agent.phone}</p>
                                </div>
                            </div>
                            <div className="car-card-footer">
                                <div className="car-card-toggles">
                                    <span className={`badge ${agent.isActive ? 'badge-success' : 'badge-danger'}`}>
                                        {agent.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="car-card-actions">
                                    <button className="action-btn" onClick={() => openModal(agent)}>✏️</button>
                                    <button className="action-btn danger" onClick={() => handleDelete(agent)}>🗑️</button>
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
                            <h3 className="modal-title">{editingAgent ? 'Edit Agent' : 'Add New Agent'}</h3>
                            <button className="action-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., John Smith" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <input className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g., Senior Sales Agent" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 123-4567" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="agent@kaysdrive.com" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Avatar Photo</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {form.avatar && (
                                            <img
                                                src={form.avatar}
                                                alt="Avatar preview"
                                                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
                                            />
                                        )}
                                        <div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                style={{ display: 'none' }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                style={{ fontSize: '0.875rem' }}
                                            >
                                                {uploading ? 'Uploading...' : form.avatar ? 'Change Photo' : 'Upload Photo'}
                                            </button>
                                            {form.avatar && (
                                                <button
                                                    type="button"
                                                    onClick={() => setForm({ ...form, avatar: '' })}
                                                    style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Bio</label>
                                    <textarea className="form-textarea" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Brief bio about the agent's experience and expertise..." />
                                </div>
                                {!editingAgent && (
                                    <div className="form-group">
                                        <label className="form-label">Initial Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            placeholder="Agent will use this to login"
                                            required
                                        />
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                            Agent will use their email and this password to login
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingAgent ? 'Update' : 'Create'}</button>
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
                            <p>Are you sure you want to delete agent <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
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
