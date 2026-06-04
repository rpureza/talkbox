const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const auth = require("../middleware/auth");
const db = require("../db");

// CREATE CHECKOUT SESSION
router.post("/create-checkout", auth, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "TalkBox Pro",
              description: "Unlimited rooms, messages, and private chats",
            },
            unit_amount: 999,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: { user_id: req.user.id.toString() },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// VERIFY PAYMENT
router.get("/verify/:sessionId", auth, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId
    );

    if (session.payment_status === "paid") {
      db.query(
        `INSERT INTO subscriptions (user_id, plan, stripe_customer_id, stripe_subscription_id, status)
         VALUES (?, 'pro', ?, ?, 'active')
         ON DUPLICATE KEY UPDATE
         plan = 'pro',
         stripe_customer_id = ?,
         stripe_subscription_id = ?,
         status = 'active'`,
        [
          req.user.id,
          session.customer,
          session.subscription,
          session.customer,
          session.subscription,
        ],
        (err) => {
          if (err) return res.status(500).json({ message: "Server error" });
          res.json({ success: true, plan: "pro" });
        }
      );
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET BILLING PORTAL
router.post("/portal", auth, async (req, res) => {
  try {
    db.query(
      "SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?",
      [req.user.id],
      async (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (results.length === 0)
          return res.status(404).json({ message: "No subscription found" });

        const session = await stripe.billingPortal.sessions.create({
          customer: results[0].stripe_customer_id,
          return_url: `${process.env.FRONTEND_URL}/dashboard`,
        });

        res.json({ url: session.url });
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;