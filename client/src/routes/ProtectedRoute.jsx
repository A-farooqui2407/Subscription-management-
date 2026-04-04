import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const ProtectedRoute = ({ roles, withLayout = false }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  if (withLayout) {
      return (
        <Layout>
          <Outlet />
        </Layout>
      );
  }

  return <Outlet />;
};

export default ProtectedRoute;
