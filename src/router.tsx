import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminLayout from './components/Admin/AdminLayout';
import AgentLayout from './components/Agent/AgentLayout';

// Lazy load heavy pages - use named imports wrapped for named exports
const CarsListingPage = lazy(() => import('./pages/CarsListingPage').then(m => ({ default: m.CarsListingPage })));
const CarDetailPage = lazy(() => import('./pages/CarDetailPage').then(m => ({ default: m.CarDetailPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const AgentsPage = lazy(() => import('./pages/AgentsPage').then(m => ({ default: m.AgentsPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('./pages/FAQPage').then(m => ({ default: m.FAQPage })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AgentLogin = lazy(() => import('./pages/AgentLogin').then(m => ({ default: m.AgentLogin })));

// Admin Pages (Lazy loaded)
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const AdminCars = lazy(() => import('./pages/Admin/Cars'));
const AdminAgents = lazy(() => import('./pages/Admin/Agents'));
const AdminContacts = lazy(() => import('./pages/Admin/Contacts'));
const AdminServices = lazy(() => import('./pages/Admin/Services'));
const AdminFAQs = lazy(() => import('./pages/Admin/FAQs'));
const AdminTestimonials = lazy(() => import('./pages/Admin/Testimonials'));
const AdminStore = lazy(() => import('./pages/Admin/Store'));
const AdminCategories = lazy(() => import('./pages/Admin/Categories'));
const AdminOrders = lazy(() => import('./pages/Admin/Orders'));

// Store Pages (Lazy loaded)
const StorePage = lazy(() => import('./pages/StorePage').then(m => ({ default: m.StorePage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));

// Agent Pages (Lazy loaded)
const AgentDashboard = lazy(() => import('./pages/Agent/Dashboard'));
const AgentMyCars = lazy(() => import('./pages/Agent/MyCars'));
const AgentProfile = lazy(() => import('./pages/Agent/Profile'));

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
            // Store / E-Commerce routes
            {
                path: 'store',
                element: <StorePage />,
            },
            {
                path: 'store/products/:id',
                element: <ProductDetailPage />,
            },
            {
                path: 'cart',
                element: <CartPage />,
            },
            {
                path: 'checkout',
                element: <CheckoutPage />,
            },
            {
                path: 'order-confirmation/:orderNumber',
                element: <OrderConfirmationPage />,
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
            {
                path: 'testimonials',
                element: <AdminTestimonials />,
            },
            // E-Commerce admin routes
            {
                path: 'store',
                element: <AdminStore />,
            },
            {
                path: 'categories',
                element: <AdminCategories />,
            },
            {
                path: 'orders',
                element: <AdminOrders />,
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
