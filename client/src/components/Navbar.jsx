import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>💬 TalkBox</Link>
      <div style={styles.links}>
        {user ? (
          <>
            <span style={styles.username}>👤 {user.username}</span>
            <button onClick={handleLogout} style={styles.button}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "1rem 2rem", backgroundColor: "#1a1a2e", color: "white",
  },
  logo: {
    color: "white", textDecoration: "none", fontSize: "1.5rem", fontWeight: "bold",
  },
  links: { display: "flex", alignItems: "center", gap: "1rem" },
  link: { color: "white", textDecoration: "none" },
  username: { color: "#a0a0b0", fontSize: "0.9rem" },
  button: {
    backgroundColor: "#e94560", color: "white", border: "none",
    padding: "0.4rem 1rem", borderRadius: "4px", cursor: "pointer",
  },
};

export default Navbar;