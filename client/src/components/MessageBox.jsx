import { useState } from "react";

const MessageBox = ({ onSend, placeholder = "Type a message..." }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        style={styles.input}
        type="text"
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button style={styles.button} type="submit">Send</button>
    </form>
  );
};

const styles = {
  form: { display: "flex", gap: "8px", padding: "1rem",
    borderTop: "1px solid #1e1e35", backgroundColor: "#1a1a2e" },
  input: { flex: 1, padding: "0.75rem 1rem", borderRadius: "8px",
    border: "1px solid #333", backgroundColor: "#0f0f1a",
    color: "white", fontSize: "15px", outline: "none" },
  button: { padding: "0.75rem 1.5rem", backgroundColor: "#e94560",
    color: "white", border: "none", borderRadius: "8px",
    cursor: "pointer", fontWeight: "600", fontSize: "15px" },
};

export default MessageBox;