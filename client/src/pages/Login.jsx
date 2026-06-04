import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "https://talkbox-production.up.railway.app";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      login(res.data.token, {
        id: res.data.id,
        email: res.data.email,
        username: res.data.username,
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>💬 Welcome to TalkBox</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="email" placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Password"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button style={styles.button} type="submit">Login</button>
        </form>
        <p style={styles.text}>
          No account? <Link to="/register" style={styles.link}>Register here</Link>
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
  text: { color: "#a0a0b0", textAlign: "center", marginTop: "1rem" },
  link: { color: "#e94560" },
};

export default Login;