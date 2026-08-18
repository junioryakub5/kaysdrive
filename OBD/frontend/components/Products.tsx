"use client";

import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Image from "next/image";

const products = [
  {
    id: "basic",
    name: "Basic Scanner",
    tagline: "Perfect for everyday drivers",
    price: 49,
    originalPrice: 79,
    image: "/scanner-lineup.png",
    badge: null,
    features: [
      "OBD2 fault code reading & clearing",
      "Engine system diagnostics",
      "Basic live data stream",
      "Battery & voltage monitoring",
      "iOS & Android app",
      "1-year warranty",
    ],
    buttonStyle: "btn-dark",
    cardBg: "bg-white",
    priceId: "price_basic",
  },
  {
    id: "pro",
    name: "Pro Scanner",
    tagline: "For car enthusiasts & mechanics",
    price: 99,
    originalPrice: 149,
    image: "/scanner-lineup.png",
    badge: "Most Popular",
    features: [
      "Everything in Basic, plus:",
      "All-system diagnostics (ABS, SRS, TPMS)",
      "Advanced live sensor data",
      "Bi-directional control tests",
      "Service reset (oil, brake, throttle)",
      "VIN auto-detection",
      "2-year warranty + priority support",
    ],
    buttonStyle: "btn-primary",
    cardBg: "bg-primary",
    priceId: "price_pro",
  },
  {
    id: "ultimate",
    name: "Ultimate Scanner",
    tagline: "Professional-grade diagnostics",
    price: 189,
    originalPrice: 279,
    image: "/scanner-lineup.png",
    badge: "Best Value",
    features: [
      "Everything in Pro, plus:",
      "One-click car coding & customization",
      "ECU programming & adaptation",
      "Manufacturer-specific functions",
      "Offline mode & cloud sync",
      "Lifetime free updates",
      "3-year warranty + dedicated support",
    ],
    buttonStyle: "btn-dark",
    cardBg: "bg-white",
    priceId: "price_ultimate",
  },
];

export default function Products() {
  const handleBuy = async (productId: string, priceId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/stripe/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, priceId }),
        }
      );
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Unable to process checkout. Please try again.");
    }
  };

  return (
    <section id="products" className="py-24 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
            Our Products
          </span>
          <h2 className="section-title text-primary mb-4">
            Choose Your <span className="accent-text">Perfect Scanner</span>
          </h2>
          <p className="section-subtitle text-center mx-auto">
            From basic fault code reading to professional ECU programming — we
            have the right tool for every driver.
          </p>
        </motion.div>

        {/* Product cards */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {products.map((p, i) => {
            const isPro = p.id === "pro";
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`product-card ${isPro ? "md:-mt-6 md:mb-6 ring-2 ring-accent" : ""}`}
              >
                <div className={`${p.cardBg} h-full flex flex-col`}>
                  {/* Badge */}
                  {p.badge && (
                    <div className="relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 px-4 py-1 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-wide shadow-lg">
                        {p.badge}
                      </div>
                    </div>
                  )}

                  {/* Image area */}
                  <div
                    className={`p-8 flex items-center justify-center ${isPro ? "bg-primary/5" : "bg-bg-light"} relative overflow-hidden`}
                    style={{ minHeight: 180 }}
                  >
                    {isPro && (
                      <div className="absolute inset-0 opacity-10"
                        style={{ background: "radial-gradient(circle at 50% 50%, #00C2FF, transparent)" }} />
                    )}
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={160}
                      height={160}
                      className="object-contain drop-shadow-xl"
                    />
                  </div>

                  {/* Content */}
                  <div className={`p-8 flex flex-col flex-1 ${isPro ? "bg-primary text-white" : ""}`}>
                    <h3 className={`text-2xl font-bold mb-1 ${isPro ? "text-white" : "text-primary"}`}>
                      {p.name}
                    </h3>
                    <p className={`text-sm mb-6 ${isPro ? "text-white/60" : "text-gray-400"}`}>
                      {p.tagline}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-8">
                      <span className={`text-4xl font-bold ${isPro ? "text-accent" : "text-primary"}`}>
                        ${p.price}
                      </span>
                      <span className={`text-sm line-through ${isPro ? "text-white/40" : "text-gray-400"}`}>
                        ${p.originalPrice}
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isPro ? "text-accent" : "text-green-500"}`} />
                          <span className={`text-sm ${isPro ? "text-white/80" : "text-gray-600"}`}>
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* 5-star rating */}
                    <div className="flex items-center gap-1 mb-6">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className={`text-xs ml-1 ${isPro ? "text-white/50" : "text-gray-400"}`}>
                        5.0 (2,400+ reviews)
                      </span>
                    </div>

                    {/* Buy button */}
                    <button
                      onClick={() => handleBuy(p.id, p.priceId)}
                      className={`w-full py-3.5 rounded-2xl font-semibold transition-all duration-300 ${
                        isPro
                          ? "bg-accent text-white hover:bg-accent-dark shadow-glow-accent"
                          : "bg-primary text-white hover:bg-primary/80"
                      }`}
                    >
                      Buy {p.name}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Guarantee row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-400"
        >
          {["🔒 Secure Checkout via Stripe", "📦 Free Worldwide Shipping", "↩️ 30-Day Money-Back Guarantee", "🛡️ 2-Year Hardware Warranty"].map((g) => (
            <span key={g}>{g}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
