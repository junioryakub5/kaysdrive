import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import RedirectLogin from './pages/RedirectLogin';
import Dashboard from './pages/Dashboard';
import Cars from './pages/Cars';
import Agents from './pages/Agents';
import Contacts from './pages/Contacts';
import Services from './pages/Services';
import FAQs from './pages/FAQs';
import Layout from './components/Layout';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<RedirectLogin />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="cars" element={<Cars />} />
        <Route path="agents" element={<Agents />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="services" element={<Services />} />
        <Route path="faqs" element={<FAQs />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
