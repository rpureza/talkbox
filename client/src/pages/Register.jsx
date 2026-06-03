import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API = "https://talkbox-production.up.railway.app";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API}/auth/register`, { username, email, password });
      setSuccess("Registered successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>💬 Join TalkBox</h2>
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="text" placeholder="Username"
            value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input style={styles.input} type="email" placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Password (min 6 chars)"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button style={styles.button} type="submit">Create Account</button>
        </form>
        <p style={styles.text}>
          Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", display: "flex", justifyContent: "center",
    alignItems: "center", backgroundColor: "#0f0f1a" },
  card: { backgroundColor: "#1a1a2e", padding: "2rem", borderRadius: "8px",
    width: "100%", maxWidth: "400px" },
  title: { color: "white", textAlign: "center", marginBottom: "1.5rem" },
  input: { width: "100%", padding: "0.75rem", marginBottom: "1rem",
    borderRadius: "4px", border: "1px solid #333", backgroundColor: "#0f0f1a",
    color: "white", boxSizing: "border-box" },
  button: { width: "100%", padding: "0.75rem", backgroundColor: "#e94560",
    color: "white", border: "none", borderRadius: "4px", cursor: "pointer",
    fontSize: "1rem" },
  error: { color: "#e94560", textAlign: "center", marginBottom: "1rem" },
  success: { color: "#4caf50", textAlign: "center", marginBottom: "1rem" },
  text: { color: "#a0a0b0", textAlign: "center", marginTop: "1rem" },
  link: { color: "#e94560" },
};

export default Register;