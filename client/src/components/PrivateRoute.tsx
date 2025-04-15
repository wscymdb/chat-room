import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, token } = useAuth();

  useEffect(() => {
    console.log("PrivateRoute - 当前用户状态:", { user, token });
  }, [user, token]);

  if (!user || !token) {
    console.log("PrivateRoute - 未登录，重定向到登录页");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
