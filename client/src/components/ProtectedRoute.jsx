import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND; // Access the BACKEND variable
        const response = await axios.get(`${backendUrl}/auth/profile`, { withCredentials: true });
        if (response.status === 200) {
          setAuthorized(true);
        } else {
          navigate("/login"); // Redirect to login if not authorized
        }
      } catch (error) {
        navigate("/login"); // Redirect on error (unauthorized)
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while checking auth
  }

  return authorized ? children : null;
}
