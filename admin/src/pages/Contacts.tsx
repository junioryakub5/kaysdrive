import { useEffect, useState } from 'react';
import { api, type ContactSubmission } from '../api';

export default function Contacts() {
    const [contacts, setContacts] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await api.getContacts();
        setContacts(data);
        setLoading(false);
    };

    const handleView = async (contact: ContactSubmission) => {
        setSelectedContact(contact);
        if (!contact.isRead) {
            await api.markContactRead(contact.id);
            loadData();
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this message?')) {
            await api.deleteContact(id);
            setSelectedContact(null);
            loadData();
        }
    };

    if (loading) return <div className="loading"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Contact Messages</h1>
                <p className="page-subtitle">View and manage customer inquiries</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Messages ({contacts.length})</h3>
                    {contacts.length === 0 ? (
                        <div className="empty-state">No messages yet</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {contacts.map(contact => (
                                <div
                                    key={contact.id}
                                    onClick={() => handleView(contact)}
                                    style={{
                                        padding: '1rem',
                                        background: selectedContact?.id === contact.id ? 'var(--primary)' : 'var(--bg-dark)',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        opacity: contact.isRead ? 0.7 : 1,
                                    }}
                                >
                                    <div className="flex justify-between items-center">
                                        <strong>{contact.name}</strong>
                                        {!contact.isRead && <span className="badge badge-warning">New</span>}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{contact.subject}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        {new Date(contact.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card">
                    {selectedContact ? (
                        <>
                            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                                <h3>{selectedContact.subject}</h3>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedContact.id)}>Delete</button>
                            </div>
                            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-dark)', borderRadius: '0.5rem' }}>
                                <p><strong>From:</strong> {selectedContact.name}</p>
                                <p><strong>Email:</strong> {selectedContact.email}</p>
                                {selectedContact.phone && <p><strong>Phone:</strong> {selectedContact.phone}</p>}
                                <p><strong>Date:</strong> {new Date(selectedContact.createdAt).toLocaleString()}</p>
                            </div>
                            <div style={{ padding: '1rem', background: 'var(--bg-dark)', borderRadius: '0.5rem' }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>Message</h4>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedContact.message}</p>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">Select a message to view</div>
                    )}
                </div>
            </div>
        </div>
    );
}
