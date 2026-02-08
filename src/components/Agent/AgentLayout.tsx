/**
 * AgentLayout - Updated to use new Dashboard components
 */
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from '../Dashboard/Layout/Sidebar';
import { Topbar } from '../Dashboard/Layout/Topbar';
import '../../styles/dashboard.css';
import '../Dashboard/Layout/DashboardLayout.css';

export default function AgentLayout() {
    const { agent } = useAuth();

    if (!agent) {
        return <Navigate to="/agent-login" replace />;
    }

    return (
        <div className="dashboard-layout">
            <Sidebar type="agent" />
            <Topbar type="agent" />

            <main className="dashboard-main">
                <Outlet />
            </main>
        </div>
    );
}
