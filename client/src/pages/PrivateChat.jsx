import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import MessageBox from "../components/MessageBox";

const API = "https://talkbox-production.up.railway.app";
let socket;

const PrivateChat = () => {
  const { userId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [typingUser, setTypingUser] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket = io(API);
    socket.emit("user_join", user);

    socket.on("private_message", (data) => {
      if (data.senderId === parseInt(userId) ||
        data.receiverId === parseInt(userId)) {
        setMessages((prev) => [...prev, data]);
      }
    });

    socket.on("typing", (data) => {
      if (data.senderId === parseInt(userId)) {
        setTypingUser(`${data.username} is typing...`);
      }
    });

    socket.on("stop_typing", () => {
      setTypingUser("");
    });

    fetchReceiver();
    fetchMessages();

    return () => socket.disconnect();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchReceiver = async () => {
    try {
      const res = await axios.get(`${API}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const found = res.data.find((u) => u.id === parseInt(userId));
      setReceiver(found);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API}/messages/private/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = (content) => {
    const data = {
      senderId: user.id,
      receiverId: parseInt(userId),
      username: user.username,
      content,
      created_at: new Date().toISOString(),
    };
    socket.emit("private_message", data);
    socket.emit("stop_typing", { receiverId: parseInt(userId) });
  };

  const handleTyping = () => {
    socket.emit("typing", {
      username: user.username,
      senderId: user.id,
      receiverId: parseInt(userId),
    });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { receiverId: parseInt(userId) });
    }, 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/")}>← Back</button>
        <div style={styles.receiverInfo}>
          <div style={styles.avatar}>
            {receiver?.username?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <div style={styles.receiverName}>{receiver?.username || "User"}</div>
            <div style={styles.status}>
              <span style={styles.statusDot}></span> Online
            </div>
          </div>
        </div>
      </div>
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} style={{ ...styles.message,
            justifyContent: msg.user_id === user.id || msg.senderId === user.id ? "flex-end" : "flex-start" }}>
            <div style={{ ...styles.bubble,
              backgroundColor: msg.user_id === user.id || msg.senderId === user.id ? "#e94560" : "#1e1e35" }}>
              <div style={styles.msgUsername}>
                {msg.user_id === user.id || msg.senderId === user.id ? "You" : receiver?.username}
              </div>
              <div>{msg.content}</div>
              <div style={styles.msgTime}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
        {typingUser && <div style={styles.typing}>{typingUser}</div>}
        <div ref={messagesEndRef} />
      </div>
      <MessageBox onSend={sendMessage} onTyping={handleTyping}
        placeholder={`Message ${receiver?.username || "user"}...`} />
    </div>
  );
};

const styles = {
  container: { display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", backgroundColor: "#0f0f1a" },
  header: { display: "flex", alignItems: "center", gap: "1rem", padding: "1rem",
    backgroundColor: "#1a1a2e", borderBottom: "1px solid #1e1e35" },
  backBtn: { background: "transparent", color: "#a0a0b0", border: "1px solid #333",
    padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "14px" },
  receiverInfo: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e94560",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "700", fontSize: "18px", color: "white" },
  receiverName: { color: "white", fontWeight: "700", fontSize: "16px" },
  status: { display: "flex", alignItems: "center", gap: "6px", color: "#4caf50", fontSize: "12px" },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#4caf50", display: "inline-block" },
  messages: { flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "8px" },
  message: { display: "flex" },
  bubble: { maxWidth: "60%", padding: "10px 14px", borderRadius: "12px", color: "white" },
  msgUsername: { fontSize: "12px", fontWeight: "700", marginBottom: "4px", opacity: 0.8 },
  msgTime: { fontSize: "11px", opacity: 0.6, marginTop: "4px", textAlign: "right" },
  typing: { color: "#a0a0b0", fontSize: "13px", fontStyle: "italic", padding: "4px 8px" },
};

export default PrivateChat;