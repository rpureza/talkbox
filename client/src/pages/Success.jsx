import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "https://talkbox-production.up.railway.app";

const Success = () => {
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      navigate("/pricing");
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.get(
          `${API}/billing/verify/${sessionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setStatus("success");
          setTimeout(() => navigate("/dashboard"), 3000);
        } else {
          setStatus("failed");
        }
      } catch (err) {
        setStatus("failed");
      }
    };

    verify();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === "verifying" && (
          <>
            <div style={styles.icon}>⏳</div>
            <h2 style={styles.title}>Verifying Payment...</h2>
            <p style={styles.desc}>Please wait while we confirm your payment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div style={styles.icon}>🎉</div>
            <h2 style={styles.title}>Welcome to Pro!</h2>
            <p style={styles.desc}>
              Your payment was successful! You now have access to all Pro features.
            </p>
            <p style={styles.redirect}>Redirecting to dashboard...</p>
          </>
        )}
        {status === "failed" && (
          <>
            <div style={styles.icon}>❌</div>
            <h2 style={styles.title}>Payment Failed</h2>
            <p style={styles.desc}>Something went wrong. Please try again.</p>
            <button style={styles.btn} onClick={() => navigate("/pricing")}>
              Back to Pricing
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#0f0f1a",
    display: "flex", justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#1a1a2e", borderRadius: "16px",
    padding: "3rem", textAlign: "center", maxWidth: "400px", width: "100%" },
  icon: { fontSize: "4rem", marginBottom: "1rem" },
  title: { color: "white", fontSize: "1.8rem", fontWeight: "700",
    marginBottom: "1rem" },
  desc: { color: "#a0a0b0", fontSize: "1rem", lineHeight: "1.6",
    marginBottom: "1rem" },
  redirect: { color: "#e94560", fontSize: "0.9rem" },
  btn: { marginTop: "1rem", padding: "0.75rem 2rem", backgroundColor: "#e94560",
    color: "white", border: "none", borderRadius: "8px",
    cursor: "pointer", fontSize: "1rem" },
};

export default Success;