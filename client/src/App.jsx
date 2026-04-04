import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Users & Contacts
import Users from './pages/Users';
import Contacts from './pages/Contacts';

// Products Flow
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Plans from './pages/Plans';

// Quotations & Subs
import QuotationTemplates from './pages/QuotationTemplates';
import Subscriptions from './pages/Subscriptions';
import SubscriptionDetail from './pages/SubscriptionDetail';

// Invoices & Payments
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import Payments from './pages/Payments';

// Financial & Accounting Admin Controls
import Taxes from './pages/Taxes';
import Discounts from './pages/Discounts';

// Dashboard & Reports
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';

// Note: Ensure all page files exist or this will crash! We'll use placeholders temporarily for uncompleted pages.
import Page404 from './pages/Page404';
import Page403 from './pages/Page403';

// Placeholder Pages (To be built in later phases)
const Placeholder = ({ title }) => <div className="p-8"><h1>{title}</h1><p>Under Construction</p></div>;

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Protected Area */}
          <Route element={<ProtectedRoute withLayout={true} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/users" element={<Users />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/taxes" element={<Taxes />} />
            <Route path="/discounts" element={<Discounts />} />
            <Route path="/quotation-templates" element={<QuotationTemplates />} />

            {/* All authenticated roles (portal = read-only in UI + API) */}
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/subscriptions/:id" element={<SubscriptionDetail />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/payments" element={<Payments />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Error pages */}
          <Route path="/403" element={<Page403 />} />
          <Route path="*" element={<Page404 />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
