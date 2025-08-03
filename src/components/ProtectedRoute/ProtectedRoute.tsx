import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { PATH_AUTH } from '../../constants';
import { Spin } from 'antd';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const authenticated = isAuthenticated();

  // Show loading spinner briefly to prevent flash
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // Small delay to allow for token validation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!authenticated) {
    // Redirect to sign-in with the current location as state
    // so we can redirect back after successful authentication
    return <Navigate to={PATH_AUTH.signin} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}; 