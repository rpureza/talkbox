import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "https://talkbox-production.up.railway.app";

const Dashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [planRes, usageRes] = await Promise.all([
          axios.get(`${API}/subscriptions/plan`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/subscriptions/check-limit`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setPlan(planRes.data);
        setUsage(usageRes.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleManageBilling = async () => {
    try {
      const res = await axios.post(
        `${API}/billing/portal`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = res.data.url;
    } catch (err) {
      alert("Error opening billing portal");
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <h1 style={styles.title}>👤 My Dashboard</h1>

        {/* PLAN INFO */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Current Plan</div>
          <div style={styles.planBadge(plan?.plan)}>
            {plan?.plan === "pro" ? "⭐ Pro" : "🆓 Free"}
          </div>
          <p style={styles.cardDesc}>
            {plan?.plan === "pro"
              ? "You have access to all Pro features!"
              : "Upgrade to Pro for unlimited access!"}
          </p>
          {plan?.plan === "pro" ? (
            <button style={styles.btnSecondary} onClick={handleManageBilling}>
              Manage Billing
            </button>
          ) : (
            <button style={styles.btnPrimary} onClick={() => navigate("/pricing")}>
              Upgrade to Pro 🚀
            </button>
          )}
        </div>

        {/* USAGE */}
        {plan?.plan === "free" && usage && (
          <div style={styles.card}>
            <div style={styles.cardTitle}>Today's Usage</div>
            <div style={styles.usageBar}>
              <div style={styles.usageFill(usage.count, usage.limit)} />
            </div>
            <p style={styles.usageText}>
              {usage.count} / {usage.limit} messages used today
            </p>
            {usage.remaining === 0 && (
              <p style={styles.limitWarning}>
                ⚠️ You've reached your daily limit! Upgrade to Pro for unlimited messages.
              </p>
            )}
          </div>
        )}

        {/* QUICK LINKS */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Quick Links</div>
          <div style={styles.links}>
            <button style={styles.linkBtn} onClick={() => navigate("/")}>
              💬 Go to Chat
            </button>
            <button style={styles.linkBtn} onClick={() => navigate("/pricing")}>
              💳 View Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#0f0f1a", padding: "2rem" },
  inner: { maxWidth: "600px", margin: "0 auto" },
  title: { color: "white", fontSize: "1.8rem", fontWeight: "700",
    marginBottom: "1.5rem" },
  card: { backgroundColor: "#1a1a2e", borderRadius: "12px",
    padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid #1e1e35" },
  cardTitle: { color: "#a0a0b0", fontSize: "12px", fontWeight: "700",
    textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1rem" },
  cardDesc: { color: "#a0a0b0", fontSize: "14px", marginBottom: "1rem" },
  planBadge: (plan) => ({
    display: "inline-block",
    backgroundColor: plan === "pro" ? "rgba(233,69,96,0.2)" : "rgba(160,160,176,0.2)",
    color: plan === "pro" ? "#e94560" : "#a0a0b0",
    padding: "6px 16px", borderRadius: "100px", fontSize: "14px",
    fontWeight: "700", marginBottom: "1rem"
  }),
  usageBar: { backgroundColor: "#0f0f1a", borderRadius: "100px",
    height: "8px", marginBottom: "0.5rem", overflow: "hidden" },
  usageFill: (count, limit) => ({
    height: "100%",
    width: `${Math.min((count / limit) * 100, 100)}%`,
    backgroundColor: count >= limit ? "#e94560" : "#4caf50",
    borderRadius: "100px", transition: "width 0.3s"
  }),
  usageText: { color: "#a0a0b0", fontSize: "13px" },
  limitWarning: { color: "#e94560", fontSize: "13px",
    marginTop: "0.5rem", fontWeight: "600" },
  links: { display: "flex", gap: "1rem" },
  linkBtn: { padding: "0.75rem 1.25rem", backgroundColor: "#0f0f1a",
    color: "white", border: "1px solid #333", borderRadius: "8px",
    cursor: "pointer", fontSize: "14px" },
  btnPrimary: { padding: "0.75rem 1.5rem", backgroundColor: "#e94560",
    color: "white", border: "none", borderRadius: "8px",
    cursor: "pointer", fontSize: "14px", fontWeight: "700" },
  btnSecondary: { padding: "0.75rem 1.5rem", backgroundColor: "transparent",
    color: "white", border: "1px solid #333", borderRadius: "8px",
    cursor: "pointer", fontSize: "14px" },
  loading: { color: "white", textAlign: "center", padding: "2rem" },
};

export default Dashboard;