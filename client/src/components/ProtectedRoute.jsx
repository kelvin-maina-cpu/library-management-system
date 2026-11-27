import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../api.js';

/**
 * Renders its children only when a JWT is stored; otherwise sends the visitor
 * to /login and remembers where they were heading.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!getToken()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return children;
}
