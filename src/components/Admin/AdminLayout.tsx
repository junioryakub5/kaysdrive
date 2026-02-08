/**
 * AdminLayout - Updated to use new Dashboard components
 */
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from '../Dashboard/Layout/Sidebar';
import { Topbar } from '../Dashboard/Layout/Topbar';
import '../../styles/dashboard.css';
import '../Dashboard/Layout/DashboardLayout.css';

export default function AdminLayout() {
    const { admin } = useAuth();

    if (!admin) {
        return <Navigate to="/admin-login" replace />;
    }

    return (
        <div className="dashboard-layout">
            <Sidebar type="admin" />
            <Topbar type="admin" />

            <main className="dashboard-main">
                <Outlet />
            </main>
        </div>
    );
}
