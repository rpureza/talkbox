const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

// GET ROOM MESSAGES
router.get("/room/:roomId", auth, (req, res) => {
  db.query(
    `SELECT messages.*, users.username 
     FROM messages 
     JOIN users ON messages.user_id = users.id
     WHERE messages.room_id = ?
     ORDER BY messages.created_at ASC`,
    [req.params.roomId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(results);
    }
  );
});

// GET PRIVATE MESSAGES
router.get("/private/:userId", auth, (req, res) => {
  db.query(
    `SELECT messages.*, users.username 
     FROM messages 
     JOIN users ON messages.user_id = users.id
     WHERE (messages.user_id = ? AND messages.receiver_id = ?)
     OR (messages.user_id = ? AND messages.receiver_id = ?)
     ORDER BY messages.created_at ASC`,
    [req.user.id, req.params.userId, req.params.userId, req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(results);
    }
  );
});

// SAVE MESSAGE
router.post("/", auth, (req, res) => {
  const { content, room_id, receiver_id } = req.body;

  if (!content)
    return res.status(400).json({ message: "Message content is required" });

  db.query(
    "INSERT INTO messages (user_id, room_id, receiver_id, content) VALUES (?, ?, ?, ?)",
    [req.user.id, room_id || null, receiver_id || null, content],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.status(201).json({ message: "Message saved", id: result.insertId });
    }
  );
});

module.exports = router;