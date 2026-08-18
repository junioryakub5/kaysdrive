"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-20 overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #0A0F2C 0%, #0D1535 50%, #0A1A3E 100%)" }} />

      {/* Glow effects */}
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "linear-gradient(rgba(0,194,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,194,255,0.3) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, #00C2FF, transparent)" }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-semibold mb-6 border border-accent/30">
            🎉 Limited Time — 40% Off All Scanners
          </span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Upgrade Your Car <br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #00C2FF, #0099CC)" }}>
              Diagnostics Today
            </span>
          </h2>

          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10">
            Join over 50,000 drivers who trust OBDPro for real-time diagnostics,
            fault code clearing, and professional car coding — right from their phone.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#products" className="btn-primary text-lg px-10 py-4 group">
              Buy Now — Save 40%
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#features" className="btn-secondary text-lg px-10 py-4">
              See All Features
            </a>
          </div>

          {/* Assurances */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-white/50">
            <span>✓ Free shipping worldwide</span>
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ No subscription fees</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
