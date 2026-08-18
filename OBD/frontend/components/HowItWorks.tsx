"use client";

import { motion } from "framer-motion";
import { Plug, Smartphone, Gauge } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Plug,
    title: "Plug Into OBD Port",
    desc: "Connect the OBDPro scanner to your car's OBD2 port — usually located under the dashboard near the steering column. No tools required.",
    color: "from-accent to-blue-600",
    detail: "Universal OBD2 — fits all cars since 1996",
  },
  {
    number: "02",
    icon: Smartphone,
    title: "Connect Mobile App",
    desc: "Open the free OBDPro app on your iPhone or Android. Pair via Bluetooth or Wi-Fi in seconds. No technical knowledge needed.",
    color: "from-purple-500 to-pink-600",
    detail: "iOS & Android — free download",
  },
  {
    number: "03",
    icon: Gauge,
    title: "Scan & Take Control",
    desc: "Run a full vehicle scan, read live sensor data, clear fault codes, and unlock hidden features — all from your phone.",
    color: "from-green-400 to-emerald-600",
    detail: "500+ car models supported",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
            Simple Setup
          </span>
          <h2 className="section-title text-primary mb-4">
            Up and Running in{" "}
            <span className="accent-text">3 Easy Steps</span>
          </h2>
          <p className="section-subtitle text-center mx-auto">
            No mechanic degree needed. OBDPro is designed for everyone — from
            car enthusiasts to everyday drivers.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-24 left-1/2 -translate-x-1/2 w-[70%] h-0.5"
            style={{ background: "linear-gradient(90deg, transparent, #00C2FF33, #00C2FF, #00C2FF33, transparent)" }} />

          <div className="grid lg:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="flex flex-col items-center text-center"
              >
                {/* Icon circle */}
                <div className="relative mb-8">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl`}
                    style={{ boxShadow: "0 0 40px rgba(0,194,255,0.3)" }}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  {/* Step number bubble */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary border-2 border-accent flex items-center justify-center text-accent text-xs font-bold">
                    {step.number.replace("0", "")}
                  </div>
                </div>

                {/* Step number label */}
                <span className="text-accent text-xs font-bold tracking-widest uppercase mb-3">
                  Step {step.number}
                </span>

                <h3 className="text-2xl font-bold text-primary mb-4">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-4">{step.desc}</p>

                {/* Detail pill */}
                <span className="inline-block px-4 py-1.5 rounded-full bg-bg-light text-gray-600 text-xs font-medium border border-gray-100">
                  ✓ {step.detail}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <a href="#products" className="btn-dark inline-flex">
            Get Started Today →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
