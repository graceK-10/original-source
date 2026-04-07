import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // If not logged in, redirect to login with return path
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If logged in but P-Number is not validated, show error message
  if (currentUser && !currentUser.isValidated) {
    return <Navigate to="/products" state={{ error: "Your P-Number has expired. Please complete onboarding again." }} replace />;
  }

  // If authenticated and validated, render the protected component
  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default PrivateRoute;
