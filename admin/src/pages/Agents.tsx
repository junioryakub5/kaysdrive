import { useEffect, useState } from 'react';
import { api, type Agent } from '../api';

export default function Agents() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

    const [form, setForm] = useState({
        name: '',
        role: '',
        phone: '',
        email: '',
        avatar: '',
        bio: '',
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
            });
        } else {
            setEditingAgent(null);
            setForm({ name: '', role: '', phone: '', email: '', avatar: '', bio: '' });
        }
        setShowModal(true);
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

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this agent?')) {
            await api.deleteAgent(id);
            loadData();
        }
    };

    if (loading) return <div className="loading"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">Agents</h1>
                    <p className="page-subtitle">Manage your sales team</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>+ Add Agent</button>
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
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
                                            <button className="action-btn danger" onClick={() => handleDelete(agent.id)}>🗑️</button>
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
                            <h3 className="modal-title">{editingAgent ? 'Edit Agent' : 'Add New Agent'}</h3>
                            <button className="action-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <input className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Avatar URL</label>
                                    <input className="form-input" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Bio</label>
                                    <textarea className="form-textarea" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingAgent ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
