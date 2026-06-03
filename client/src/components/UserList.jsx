const UserList = ({ users, onSelectUser, selectedUserId }) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>👥 Online Users</div>
      {users.length === 0 ? (
        <p style={styles.empty}>No users online</p>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            style={{
              ...styles.userItem,
              backgroundColor: selectedUserId === user.id ? "#1e1e35" : "transparent",
            }}
            onClick={() => onSelectUser(user)}
          >
            <div style={styles.avatar}>{user.username[0].toUpperCase()}</div>
            <div style={styles.userInfo}>
              <div style={styles.username}>{user.username}</div>
              <div style={styles.status}>
                <span style={styles.statusDot}></span>
                Online
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: { width: "250px", backgroundColor: "#1a1a2e",
    borderRight: "1px solid #1e1e35", overflowY: "auto" },
  header: { padding: "1rem", fontWeight: "700", fontSize: "14px",
    color: "#a0a0b0", borderBottom: "1px solid #1e1e35",
    textTransform: "uppercase", letterSpacing: "1px" },
  empty: { color: "#a0a0b0", padding: "1rem", fontSize: "14px" },
  userItem: { display: "flex", alignItems: "center", gap: "12px",
    padding: "12px 16px", cursor: "pointer", transition: "background 0.2s",
    borderBottom: "1px solid #1e1e35" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%",
    backgroundColor: "#e94560", display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: "700", fontSize: "16px",
    color: "white", flexShrink: 0 },
  userInfo: { flex: 1 },
  username: { color: "white", fontWeight: "600", fontSize: "14px" },
  status: { display: "flex", alignItems: "center", gap: "6px",
    color: "#4caf50", fontSize: "12px", marginTop: "2px" },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%",
    backgroundColor: "#4caf50", display: "inline-block" },
};

export default UserList;