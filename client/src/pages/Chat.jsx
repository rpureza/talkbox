import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import MessageBox from "../components/MessageBox";
import UserList from "../components/UserList";

const API = "https://talkbox-production.up.railway.app";
let socket;

const Chat = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket = io(API);
    socket.emit("user_join", user);

    socket.on("online_users", (users) => {
      setOnlineUsers(users.filter((u) => u.id !== user.id));
    });

    socket.on("room_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("typing", (data) => {
      setTypingUser(`${data.username} is typing...`);
    });

    socket.on("stop_typing", () => {
      setTypingUser("");
    });

    fetchRooms();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
      if (res.data.length > 0) joinRoom(res.data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const joinRoom = async (room) => {
    if (activeRoom) socket.emit("leave_room", activeRoom.id.toString());
    setActiveRoom(room);
    socket.emit("join_room", room.id.toString());
    try {
      const res = await axios.get(`${API}/messages/room/${room.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = (content) => {
    if (!activeRoom) return;
    const data = {
      userId: user.id,
      username: user.username,
      roomId: activeRoom.id.toString(),
      content,
      created_at: new Date().toISOString(),
    };
    socket.emit("room_message", data);
    socket.emit("stop_typing", { roomId: activeRoom.id.toString() });
  };

  const handleTyping = () => {
    if (!activeRoom) return;
    socket.emit("typing", {
      username: user.username,
      roomId: activeRoom.id.toString(),
    });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { roomId: activeRoom.id.toString() });
    }, 2000);
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      await axios.post(`${API}/rooms`,
        { name: newRoomName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewRoomName("");
      setShowCreateRoom(false);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating room");
    }
  };

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span>💬 Rooms</span>
          <button style={styles.addBtn} onClick={() => setShowCreateRoom(!showCreateRoom)}>+</button>
        </div>
        {showCreateRoom && (
          <div style={styles.createRoom}>
            <input style={styles.roomInput} placeholder="Room name"
              value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} />
            <button style={styles.createBtn} onClick={createRoom}>Create</button>
          </div>
        )}
        {rooms.map((room) => (
          <div key={room.id}
            style={{ ...styles.roomItem, backgroundColor: activeRoom?.id === room.id ? "#1e1e35" : "transparent" }}
            onClick={() => joinRoom(room)}>
            # {room.name}
          </div>
        ))}
      </div>

      {/* MAIN CHAT */}
      <div style={styles.main}>
        <div style={styles.chatHeader}>
          {activeRoom ? `# ${activeRoom.name}` : "Select a room"}
        </div>
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} style={{ ...styles.message,
              justifyContent: msg.user_id === user.id || msg.userId === user.id ? "flex-end" : "flex-start" }}>
              <div style={{ ...styles.bubble,
                backgroundColor: msg.user_id === user.id || msg.userId === user.id ? "#e94560" : "#1e1e35" }}>
                <div style={styles.msgUsername}>
                  {msg.user_id === user.id || msg.userId === user.id ? "You" : msg.username}
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
          placeholder={activeRoom ? `Message #${activeRoom.name}` : "Select a room first"} />
      </div>

      {/* USERS */}
      <UserList users={onlineUsers} onSelectUser={(u) => navigate(`/private/${u.id}`)}
        selectedUserId={null} />
    </div>
  );
};

const styles = {
  container: { display: "flex", height: "calc(100vh - 60px)", backgroundColor: "#0f0f1a" },
  sidebar: { width: "220px", backgroundColor: "#1a1a2e", borderRight: "1px solid #1e1e35", overflowY: "auto" },
  sidebarHeader: { padding: "1rem", fontWeight: "700", fontSize: "14px", color: "#a0a0b0",
    borderBottom: "1px solid #1e1e35", textTransform: "uppercase", letterSpacing: "1px",
    display: "flex", justifyContent: "space-between", alignItems: "center" },
  addBtn: { background: "#e94560", color: "white", border: "none", borderRadius: "6px",
    width: "32px", height: "32px", cursor: "pointer", fontSize: "18px", lineHeight: "1",
    display: "flex", alignItems: "center", justifyContent: "center" },
 createRoom: { padding: "0.75rem", borderBottom: "1px solid #1e1e35", display: "flex", gap: "8px" },
roomInput: { flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #e94560",
  backgroundColor: "#0f0f1a", color: "white", fontSize: "13px", width: "100%" },
createBtn: { padding: "0.5rem 0.75rem", backgroundColor: "#e94560", color: "white",
  border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px", fontWeight: "700" },
  roomItem: { padding: "12px 16px", cursor: "pointer", color: "#a0a0b0", fontSize: "14px",
    borderBottom: "1px solid #1e1e35", transition: "background 0.2s" },
  main: { flex: 1, display: "flex", flexDirection: "column" },
  chatHeader: { padding: "1rem", fontWeight: "700", fontSize: "16px", color: "white",
    borderBottom: "1px solid #1e1e35", backgroundColor: "#1a1a2e" },
  messages: { flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "8px" },
  message: { display: "flex" },
  bubble: { maxWidth: "60%", padding: "10px 14px", borderRadius: "12px", color: "white" },
  msgUsername: { fontSize: "12px", fontWeight: "700", marginBottom: "4px", opacity: 0.8 },
  msgTime: { fontSize: "11px", opacity: 0.6, marginTop: "4px", textAlign: "right" },
  typing: { color: "#a0a0b0", fontSize: "13px", fontStyle: "italic", padding: "4px 8px" },
};

export default Chat;