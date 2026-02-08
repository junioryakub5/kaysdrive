import { useEffect, useState } from 'react';
import "../../components/Admin/AdminDashboard.css";
import { adminApi as api, type ContactSubmission } from '../../services/adminApi';

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
                <div className="page-header-content">
                    <h1 className="dashboard-title">Contact Messages</h1>
                    <p className="dashboard-subtitle">View and manage customer inquiries</p>
                </div>
            </div>

            <div className="contacts-grid">
                <div className="dashboard-card">
                    <h3 className="section-title">Messages ({contacts.length})</h3>
                    {contacts.length === 0 ? (
                        <div className="empty-state">No messages yet</div>
                    ) : (
                        <div className="message-list">
                            {contacts.map(contact => (
                                <div
                                    key={contact.id}
                                    onClick={() => handleView(contact)}
                                    className={`message-item ${selectedContact?.id === contact.id ? 'active' : ''} ${contact.isRead ? 'read' : ''}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <strong>{contact.name}</strong>
                                        {!contact.isRead && <span className="badge badge-warning">New</span>}
                                    </div>
                                    <div className="message-subject">{contact.subject}</div>
                                    <div className="message-date">
                                        {new Date(contact.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dashboard-card">
                    {selectedContact ? (
                        <>
                            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                                <h3 className="section-title" style={{ margin: 0 }}>{selectedContact.subject}</h3>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedContact.id)}>Delete</button>
                            </div>
                            <div className="message-details">
                                <p><strong>From:</strong> {selectedContact.name}</p>
                                <p><strong>Email:</strong> {selectedContact.email}</p>
                                {selectedContact.phone && <p><strong>Phone:</strong> {selectedContact.phone}</p>}
                                <p><strong>Date:</strong> {new Date(selectedContact.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="message-content">
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
