"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, Shield, Cpu, Wifi } from "lucide-react";
import Image from "next/image";

const floatingBadges = [
  { icon: Shield, label: "Secure", color: "text-accent", delay: 0 },
  { icon: Cpu, label: "Fast Scan", color: "text-green-400", delay: 1.5 },
  { icon: Wifi, label: "Wireless", color: "text-purple-400", delay: 3 },
];

export default function Hero() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!particlesRef.current) return;
    const container = particlesRef.current;
    Array.from({ length: 30 }).forEach((_, i) => {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${8 + Math.random() * 12}s`;
      p.style.animationDelay = `${Math.random() * 8}s`;
      p.style.width = `${1 + Math.random() * 3}px`;
      p.style.height = p.style.width;
      p.style.opacity = `${0.3 + Math.random() * 0.7}`;
      container.appendChild(p);
    });
    return () => { container.innerHTML = ""; };
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0A0F2C 0%, #0D1535 40%, #0A1A3E 70%, #0A0F2C 100%)" }}
    >
      {/* Animated particles */}
      <div ref={particlesRef} className="bg-particles" />

      {/* Radial glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #00C2FF 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #0066FF 0%, transparent 70%)" }} />

      {/* Grid lines background */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "linear-gradient(rgba(0,194,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,194,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              Next-Gen OBD2 Technology
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Professional Car{" "}
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #00C2FF, #0099CC)" }}>
                Diagnostics
              </span>{" "}
              In Your Pocket
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-white/70 mb-10 leading-relaxed max-w-xl"
            >
              Scan, diagnose and customize your vehicle using the most powerful
              OBD scanner. Real-time data, fault codes, and car coding — all in
              one device.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <a href="#products" className="btn-primary group text-base">
                Buy Scanner
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="#how-it-works" className="btn-secondary group text-base">
                <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-accent ml-0.5" />
                </span>
                See How It Works
              </a>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-8"
            >
              {[
                { value: "500+", label: "Car Models" },
                { value: "50K+", label: "Happy Users" },
                { value: "99.9%", label: "Accuracy" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/50">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — product image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            {/* Glow ring */}
            <div className="absolute w-72 h-72 rounded-full opacity-30 blur-3xl animate-pulse-glow"
              style={{ background: "radial-gradient(circle, #00C2FF, transparent)" }} />

            {/* Product image */}
            <div className="relative z-10 animate-float">
              <Image
                src="/scanner-hero.png"
                alt="OBDPro Scanner — Professional Car Diagnostic Tool"
                width={480}
                height={480}
                className="drop-shadow-2xl"
                priority
              />
            </div>

            {/* Floating badges */}
            {floatingBadges.map(({ icon: Icon, label, color, delay }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + delay * 0.2, duration: 0.5 }}
                className="absolute glass-card px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-white"
                style={{
                  top: delay === 0 ? "15%" : delay === 1.5 ? "50%" : "75%",
                  left: delay === 1.5 ? "-10%" : "auto",
                  right: delay === 0 ? "-5%" : delay === 3 ? "0" : "auto",
                }}
              >
                <Icon className={`w-4 h-4 ${color}`} />
                {label}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-xs"
      >
        <span>Scroll to explore</span>
        <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-accent rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
