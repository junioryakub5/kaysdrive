const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");

// Product catalog with Stripe Price IDs
// Replace these price IDs with your real Stripe Price IDs after creating products in the Dashboard
const PRODUCTS = {
  basic: {
    name: "OBDPro Basic Scanner",
    priceId: process.env.STRIPE_PRICE_BASIC || "price_basic_placeholder",
    unitAmount: 4900, // $49.00
  },
  pro: {
    name: "OBDPro Pro Scanner",
    priceId: process.env.STRIPE_PRICE_PRO || "price_pro_placeholder",
    unitAmount: 9900, // $99.00
  },
  ultimate: {
    name: "OBDPro Ultimate Scanner",
    priceId: process.env.STRIPE_PRICE_ULTIMATE || "price_ultimate_placeholder",
    unitAmount: 18900, // $189.00
  },
};

// POST /api/stripe/checkout — Create Stripe Checkout Session
router.post("/checkout", async (req, res) => {
  try {
    const { productId } = req.body;
    const product = PRODUCTS[productId];

    if (!product) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: "Professional OBD2 car diagnostic scanner",
              images: [`${frontendUrl}/scanner-hero.png`],
            },
            unit_amount: product.unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cancel`,
      metadata: {
        productId,
        productName: product.name,
      },
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "NL", "BE"],
      },
    });

    // Create a pending order in the database
    try {
      await Order.create({
        stripeSessionId: session.id,
        productId,
        productName: product.name,
        amount: product.unitAmount,
        status: "pending",
      });
    } catch (dbErr) {
      console.warn("DB order creation failed (non-fatal):", dbErr.message);
    }

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// POST /api/stripe/webhook — Handle Stripe events
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      try {
        await Order.findOneAndUpdate(
          { stripeSessionId: session.id },
          {
            status: "paid",
            stripePaymentIntentId: session.payment_intent,
            customerEmail: session.customer_details?.email,
            customerName: session.customer_details?.name,
            shippingAddress: session.shipping_details?.address,
          }
        );
        console.log(`✅ Order paid: ${session.id}`);
      } catch (err) {
        console.error("Failed to update order:", err.message);
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      await Order.findOneAndUpdate(
        { stripeSessionId: session.id },
        { status: "failed" }
      ).catch(() => {});
      break;
    }
    default:
      break;
  }

  res.json({ received: true });
});

module.exports = router;
