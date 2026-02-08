import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { CarsListingPage } from './pages/CarsListingPage';
import { CarDetailPage } from './pages/CarDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { AgentsPage } from './pages/AgentsPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { AdminLogin } from './pages/AdminLogin';
import { AgentLogin } from './pages/AgentLogin';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminLayout from './components/Admin/AdminLayout';
import AgentLayout from './components/Agent/AgentLayout';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminCars from './pages/Admin/Cars';
import AdminAgents from './pages/Admin/Agents';
import AdminContacts from './pages/Admin/Contacts';
import AdminServices from './pages/Admin/Services';
import AdminFAQs from './pages/Admin/FAQs';

// Agent Pages
import AgentDashboard from './pages/Agent/Dashboard';
import AgentMyCars from './pages/Agent/MyCars';
import AgentProfile from './pages/Agent/Profile';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: 'cars',
                element: <CarsListingPage />,
            },
            {
                path: 'cars/:slug',
                element: <CarDetailPage />,
            },
            {
                path: 'about',
                element: <AboutPage />,
            },
            {
                path: 'services',
                element: <ServicesPage />,
            },
            {
                path: 'agents',
                element: <AgentsPage />,
            },
            {
                path: 'contact',
                element: <ContactPage />,
            },
            {
                path: 'faq',
                element: <FAQPage />,
            },
            {
                path: 'admin-login',
                element: <AdminLogin />,
            },
            {
                path: 'agent-login',
                element: <AgentLogin />,
            },
        ],
    },
    // Admin Routes (Protected)
    {
        path: '/admin',
        element: (
            <ProtectedRoute type="admin">
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: <AdminDashboard />,
            },
            {
                path: 'cars',
                element: <AdminCars />,
            },
            {
                path: 'agents',
                element: <AdminAgents />,
            },
            {
                path: 'contacts',
                element: <AdminContacts />,
            },
            {
                path: 'services',
                element: <AdminServices />,
            },
            {
                path: 'faqs',
                element: <AdminFAQs />,
            },
        ],
    },
    // Agent Routes (Protected)
    {
        path: '/agent',
        element: (
            <ProtectedRoute type="agent">
                <AgentLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: <AgentDashboard />,
            },
            {
                path: 'cars',
                element: <AgentMyCars />,
            },
            {
                path: 'profile',
                element: <AgentProfile />,
            },
        ],
    },
]);
