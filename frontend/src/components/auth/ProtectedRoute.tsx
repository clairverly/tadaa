import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Authentication temporarily disabled
  // Users can access all routes without logging in
  return <>{children}</>;
};