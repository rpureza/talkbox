import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "https://talkbox-production.up.railway.app";

const Pricing = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/billing/create-checkout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = res.data.url;
    } catch (err) {
      alert("Error creating checkout session");
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Choose Your Plan</h1>
      <p style={styles.subtitle}>Start for free, upgrade when you need more</p>

      <div style={styles.grid}>
        {/* FREE PLAN */}
        <div style={styles.card}>
          <div style={styles.planName}>Free</div>
          <div style={styles.price}>$0<span style={styles.period}>/month</span></div>
          <ul style={styles.features}>
            <li style={styles.feature}>✅ 1 chat room</li>
            <li style={styles.feature}>✅ 50 messages per day</li>
            <li style={styles.feature}>✅ Basic real-time chat</li>
            <li style={styles.feature}>❌ Private messaging</li>
            <li style={styles.feature}>❌ Unlimited rooms</li>
            <li style={styles.feature}>❌ Message history</li>
          </ul>
          <button style={styles.btnSecondary} onClick={() => navigate("/")}>
            Get Started Free
          </button>
        </div>

        {/* PRO PLAN */}
        <div style={{ ...styles.card, ...styles.cardPro }}>
          <div style={styles.popular}>⭐ Most Popular</div>
          <div style={{ ...styles.planName, color: "#e94560" }}>Pro</div>
          <div style={styles.price}>$9.99<span style={styles.period}>/month</span></div>
          <ul style={styles.features}>
            <li style={styles.feature}>✅ Unlimited chat rooms</li>
            <li style={styles.feature}>✅ Unlimited messages</li>
            <li style={styles.feature}>✅ Private messaging</li>
            <li style={styles.feature}>✅ Full message history</li>
            <li style={styles.feature}>✅ Online status indicators</li>
            <li style={styles.feature}>✅ Priority support</li>
          </ul>
          <button
            style={styles.btnPrimary}
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? "Redirecting..." : "Upgrade to Pro 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#0f0f1a",
    padding: "4rem 2rem", textAlign: "center" },
  title: { color: "white", fontSize: "2.5rem", fontWeight: "700",
    marginBottom: "1rem" },
  subtitle: { color: "#a0a0b0", fontSize: "1.1rem", marginBottom: "3rem" },
  grid: { display: "flex", gap: "2rem", justifyContent: "center",
    flexWrap: "wrap", maxWidth: "800px", margin: "0 auto" },
  card: { backgroundColor: "#1a1a2e", border: "1px solid #1e1e35",
    borderRadius: "16px", padding: "2rem", width: "300px",
    textAlign: "left", position: "relative" },
  cardPro: { border: "2px solid #e94560",
    boxShadow: "0 0 40px rgba(233,69,96,0.15)" },
  popular: { position: "absolute", top: "-12px", left: "50%",
    transform: "translateX(-50%)", backgroundColor: "#e94560",
    color: "white", padding: "4px 16px", borderRadius: "100px",
    fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap" },
  planName: { color: "white", fontSize: "1.5rem", fontWeight: "700",
    marginBottom: "0.5rem", marginTop: "0.5rem" },
  price: { color: "white", fontSize: "2.5rem", fontWeight: "800",
    marginBottom: "1.5rem" },
  period: { fontSize: "1rem", color: "#a0a0b0", fontWeight: "400" },
  features: { listStyle: "none", padding: 0, marginBottom: "2rem" },
  feature: { color: "#a0a0b0", fontSize: "14px", marginBottom: "10px",
    lineHeight: "1.5" },
  btnPrimary: { width: "100%", padding: "0.875rem", backgroundColor: "#e94560",
    color: "white", border: "none", borderRadius: "8px", cursor: "pointer",
    fontSize: "1rem", fontWeight: "700" },
  btnSecondary: { width: "100%", padding: "0.875rem", backgroundColor: "transparent",
    color: "white", border: "1px solid #333", borderRadius: "8px",
    cursor: "pointer", fontSize: "1rem" },
};

export default Pricing;