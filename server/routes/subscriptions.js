const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

// GET USER PLAN
router.get("/plan", auth, (req, res) => {
  db.query(
    "SELECT * FROM subscriptions WHERE user_id = ?",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0) {
        return res.json({ plan: "free", status: "active" });
      }
      res.json(results[0]);
    }
  );
});

// CHECK MESSAGE LIMIT (free = 50/day)
router.get("/check-limit", auth, (req, res) => {
  // Get user plan first
  db.query(
    "SELECT plan FROM subscriptions WHERE user_id = ?",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });

      const plan = results.length > 0 ? results[0].plan : "free";

      // Pro users have no limits
      if (plan === "pro") {
        return res.json({ allowed: true, plan: "pro", remaining: "unlimited" });
      }

      // Count today's messages for free users
      db.query(
        `SELECT COUNT(*) as count FROM usage_logs 
         WHERE user_id = ? AND action = 'message' 
         AND DATE(created_at) = CURDATE()`,
        [req.user.id],
        (err, results) => {
          if (err) return res.status(500).json({ message: "Server error" });
          const count = results[0].count;
          const limit = 50;
          const remaining = limit - count;
          res.json({
            allowed: count < limit,
            plan: "free",
            count,
            limit,
            remaining: Math.max(0, remaining),
          });
        }
      );
    }
  );
});

// LOG MESSAGE USAGE
router.post("/log-usage", auth, (req, res) => {
  const { action } = req.body;
  db.query(
    "INSERT INTO usage_logs (user_id, action) VALUES (?, ?)",
    [req.user.id, action || "message"],
    (err) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Usage logged" });
    }
  );
});

// UPGRADE TO PRO (after Stripe payment)
router.post("/upgrade", auth, (req, res) => {
  const { stripe_customer_id, stripe_subscription_id } = req.body;

  db.query(
    `INSERT INTO subscriptions (user_id, plan, stripe_customer_id, stripe_subscription_id, status)
     VALUES (?, 'pro', ?, ?, 'active')
     ON DUPLICATE KEY UPDATE 
     plan = 'pro', 
     stripe_customer_id = ?,
     stripe_subscription_id = ?,
     status = 'active'`,
    [req.user.id, stripe_customer_id, stripe_subscription_id,
     stripe_customer_id, stripe_subscription_id],
    (err) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Upgraded to Pro!" });
    }
  );
});

// CANCEL SUBSCRIPTION
router.post("/cancel", auth, (req, res) => {
  db.query(
    "UPDATE subscriptions SET plan = 'free', status = 'cancelled' WHERE user_id = ?",
    [req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Subscription cancelled" });
    }
  );
});

module.exports = router;