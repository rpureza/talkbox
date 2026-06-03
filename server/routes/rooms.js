const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

// GET ALL ROOMS
router.get("/", auth, (req, res) => {
  db.query(
    `SELECT rooms.*, users.username as creator 
     FROM rooms 
     LEFT JOIN users ON rooms.created_by = users.id
     ORDER BY rooms.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(results);
    }
  );
});

// CREATE ROOM
router.post("/", auth, (req, res) => {
  const { name, description } = req.body;

  if (!name)
    return res.status(400).json({ message: "Room name is required" });

  db.query(
    "INSERT INTO rooms (name, description, created_by) VALUES (?, ?, ?)",
    [name, description, req.user.id],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(409).json({ message: "Room name already exists" });
        return res.status(500).json({ message: "Server error" });
      }
      res.status(201).json({ message: "Room created", id: result.insertId });
    }
  );
});

// DELETE ROOM
router.delete("/:id", auth, (req, res) => {
  db.query(
    "DELETE FROM rooms WHERE id = ? AND created_by = ?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Room deleted" });
    }
  );
});

module.exports = router;