import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api.js";

function ActivateAccount() {
  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();
  const [message, setMessage] = useState("Activating your account...");

  useEffect(() => {
    const activate = async () => {
      try {
        await API.get(`/auth/activate/${token}`);
        setMessage("✅ Account activated successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000); // Redirect after 3 seconds
      } catch (err) {
        console.error(err);
        setMessage("❌ Activation failed. Invalid or expired token.");
      }
    };

    if (token) activate();
  }, [token, navigate]);

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Activate Account</h2>
      <p>{message}</p>
    </div>
  );
}

export default ActivateAccount;
