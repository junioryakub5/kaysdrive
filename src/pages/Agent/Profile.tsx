import { useEffect, useState, useRef } from 'react';
import { agentApi } from '../../services/adminApi';
import '../../components/Admin/AdminDashboard.css';

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        name: '',
        role: '',
        phone: '',
        avatar: '',
        bio: '',
        password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { agent } = await agentApi.getProfile();
            setForm({
                name: agent.name || '',
                role: agent.role || '',
                phone: agent.phone || '',
                avatar: agent.avatar || '',
                bio: agent.bio || '',
                password: '',
                confirmPassword: '',
            });
        } catch (error) {
            console.error('Error loading profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

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
            setMessage({ type: 'error', text: 'Failed to upload photo' });
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Validate password if changing
        if (form.password) {
            if (form.password.length < 6) {
                setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
                return;
            }
            if (form.password !== form.confirmPassword) {
                setMessage({ type: 'error', text: 'Passwords do not match' });
                return;
            }
        }

        setSaving(true);
        try {
            const updateData: any = {
                name: form.name,
                role: form.role,
                phone: form.phone,
                avatar: form.avatar,
                bio: form.bio,
            };

            if (form.password) {
                updateData.password = form.password;
            }

            await agentApi.updateProfile(updateData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setForm({ ...form, password: '', confirmPassword: '' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Update your profile information</p>
                </div>
            </div>

            {message && (
                <div
                    style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        background: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
                        border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
                    }}
                >
                    {message.text}
                </div>
            )}

            <div className="card" style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSubmit}>
                    {/* Avatar Section */}
                    <div className="form-group" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            margin: '0 auto 1rem',
                            overflow: 'hidden',
                            border: '3px solid var(--border)',
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {form.avatar ? (
                                <img src={form.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '3rem', color: 'var(--text-muted)' }}>👤</span>
                            )}
                        </div>
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
                        >
                            {uploading ? 'Uploading...' : 'Change Photo'}
                        </button>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input
                            className="form-input"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="Your full name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Role / Title</label>
                        <input
                            className="form-input"
                            value={form.role}
                            onChange={e => setForm({ ...form, role: e.target.value })}
                            placeholder="Your job title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                            className="form-input"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bio</label>
                        <textarea
                            className="form-textarea"
                            value={form.bio}
                            onChange={e => setForm({ ...form, bio: e.target.value })}
                            placeholder="Tell customers about yourself..."
                            rows={4}
                        />
                    </div>

                    <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />

                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Change Password</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Leave blank to keep your current password
                    </p>

                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={form.confirmPassword}
                            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                        />
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
