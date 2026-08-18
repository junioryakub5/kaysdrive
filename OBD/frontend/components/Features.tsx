"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Activity,
  Gauge,
  Code2,
  AlertTriangle,
  Smartphone,
  Car,
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Full Vehicle Diagnostics",
    desc: "Deep-scan all vehicle systems including engine, transmission, ABS, airbags, and more.",
    color: "from-blue-500 to-accent",
  },
  {
    icon: Gauge,
    title: "Live Sensor Data",
    desc: "Monitor real-time data streams from hundreds of sensors simultaneously.",
    color: "from-green-400 to-emerald-600",
  },
  {
    icon: Code2,
    title: "One-Click Car Coding",
    desc: "Enable hidden features, customize vehicle settings and unlock OEM functions with ease.",
    color: "from-purple-500 to-violet-700",
  },
  {
    icon: AlertTriangle,
    title: "Fault Code Scanning",
    desc: "Read, interpret, and clear diagnostic trouble codes (DTCs) across all modules.",
    color: "from-orange-400 to-red-500",
  },
  {
    icon: Smartphone,
    title: "Mobile App Integration",
    desc: "Seamlessly pairs with iOS and Android apps for an intuitive wireless experience.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Car,
    title: "500+ Car Models",
    desc: "Compatible with virtually all OBD2-compliant vehicles from 1996 onwards worldwide.",
    color: "from-cyan-400 to-accent",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

export default function Features() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="features" className="py-24 bg-bg-light">
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
            Powerful Features
          </span>
          <h2 className="section-title text-primary mb-4">
            Everything You Need to{" "}
            <span className="accent-text">Master Your Car</span>
          </h2>
          <p className="section-subtitle text-center mx-auto">
            OBDPro gives you professional-grade tools that were once only
            available to dealerships and certified mechanics.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariants}
              className="feature-card group cursor-pointer"
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <f.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              <div className="mt-5 flex items-center gap-2 text-accent font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more →
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
