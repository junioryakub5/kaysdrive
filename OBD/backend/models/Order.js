const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    stripeSessionId: { type: String, required: true, unique: true },
    stripePaymentIntentId: { type: String },
    productId: { type: String, required: true },
    productName: { type: String },
    amount: { type: Number }, // in cents
    currency: { type: String, default: "usd" },
    customerEmail: { type: String },
    customerName: { type: String },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    shippingAddress: {
      line1: String,
      city: String,
      country: String,
      postal_code: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
