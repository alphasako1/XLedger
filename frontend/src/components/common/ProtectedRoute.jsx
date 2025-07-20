import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/" replace />; // not logged in
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />; // wrong role
  }

  return children;
}
