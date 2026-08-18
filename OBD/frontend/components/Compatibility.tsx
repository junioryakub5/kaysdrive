"use client";

import { motion } from "framer-motion";

const brands = [
  { name: "Audi", logo: "🔷", color: "#C00" },
  { name: "BMW", logo: "🔵", color: "#1C69D3" },
  { name: "Mercedes", logo: "⭐", color: "#222" },
  { name: "Toyota", logo: "🔴", color: "#EB0A1E" },
  { name: "Honda", logo: "🔵", color: "#CC0000" },
  { name: "Volkswagen", logo: "🔷", color: "#00438A" },
  { name: "Ford", logo: "🔵", color: "#003478" },
  { name: "Nissan", logo: "🔴", color: "#C3002F" },
  { name: "Hyundai", logo: "🔷", color: "#002C5E" },
  { name: "Kia", logo: "🔵", color: "#05141F" },
  { name: "Porsche", logo: "⭐", color: "#D5001C" },
  { name: "Mazda", logo: "🔴", color: "#85001C" },
];

// SVG car brand monogram component
function BrandLogo({ name, color }: { name: string; color: string }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke={color} strokeWidth="2" fill={`${color}15`} />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fill={color}
        fontSize="16"
        fontWeight="800"
        fontFamily="Poppins, sans-serif"
      >
        {name.slice(0, 2).toUpperCase()}
      </text>
    </svg>
  );
}

export default function Compatibility() {
  return (
    <section id="compatibility" className="py-24 bg-white">
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
            Compatibility
          </span>
          <h2 className="section-title text-primary mb-4">
            Works With <span className="accent-text">Your Car</span>
          </h2>
          <p className="section-subtitle text-center mx-auto">
            OBDPro supports 500+ car models from all major manufacturers. If
            your car was made after 1996, it almost certainly works.
          </p>
        </motion.div>

        {/* Brand grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 mb-12">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ scale: 1.1, y: -4 }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-bg-light hover:bg-white hover:shadow-card transition-all duration-300 cursor-pointer group"
            >
              <BrandLogo name={brand.name} color={brand.color} />
              <span className="text-xs font-semibold text-gray-600 group-hover:text-primary transition-colors">
                {brand.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* OBD2 banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl overflow-hidden p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg, #0A0F2C 0%, #0D1535 100%)" }}
        >
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Universal OBD2 Compatibility
            </h3>
            <p className="text-white/60 max-w-lg">
              OBDPro connects to the standardized OBD2 port found in all
              gasoline and diesel vehicles manufactured after 1996 in the US,
              Europe, and Asia.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {["US Cars", "EU Cars", "Asian Cars", "Trucks", "Hybrids", "Diesels"].map((t) => (
              <span key={t} className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium border border-white/20">
                ✓ {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
