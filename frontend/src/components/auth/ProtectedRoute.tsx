import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredRole?: string;
}

export const ProtectedRoute = ({ children, allowedRoles, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        // Not authenticated, redirect to home
        navigate('/');
        return;
      }

      // Check if user has the required role
      if (requiredRole && user.role !== requiredRole) {
        // Redirect to correct dashboard based on user's actual role
        switch (user.role) {
          case 'learner':
            navigate('/dashboard/learner');
            break;
          case 'trainer':
            navigate('/dashboard/trainer');
            break;
          case 'policymaker':
            navigate('/dashboard/policy');
            break;
          default:
            navigate('/dashboard/learner');
        }
        return;
      }

      // Check if user role is in allowed roles
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to correct dashboard based on user's actual role
        switch (user.role) {
          case 'learner':
            navigate('/dashboard/learner');
            break;
          case 'trainer':
            navigate('/dashboard/trainer');
            break;
          case 'policymaker':
            navigate('/dashboard/policy');
            break;
          default:
            navigate('/dashboard/learner');
        }
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, navigate, allowedRoles, requiredRole]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check role restrictions
  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;