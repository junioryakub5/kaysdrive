"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "James Mitchell",
    role: "Car Enthusiast",
    initials: "JM",
    color: "from-blue-600 to-accent",
    rating: 5,
    review:
      "Absolutely blown away by OBDPro. Diagnosed a misfire that would have cost me $300 at a dealership in 2 minutes from my driveway. The car coding feature unlocked features I didn't know my BMW had!",
    car: "BMW 3 Series 2021",
  },
  {
    name: "Sarah Okonkwo",
    role: "Independent Mechanic",
    initials: "SO",
    color: "from-purple-600 to-pink-600",
    rating: 5,
    review:
      "I've tried a dozen OBD tools in my shop. OBDPro Ultimate is the first one that genuinely rivals the professional equipment — at a fraction of the price. My whole team uses it now.",
    car: "Used on 50+ vehicles",
  },
  {
    name: "Carlos Rivera",
    role: "Daily Commuter",
    initials: "CR",
    color: "from-green-500 to-teal-600",
    rating: 5,
    review:
      "Super easy to set up! The app is beautiful, the scanner connected instantly to my Honda, and I cleared a mystery engine light that my garage couldn't explain. Worth every penny.",
    car: "Honda Civic 2019",
  },
  {
    name: "Emma Thompson",
    role: "Fleet Manager",
    initials: "ET",
    color: "from-orange-500 to-red-600",
    rating: 5,
    review:
      "We manage 40 vehicles and OBDPro Pro has saved us thousands in preventative maintenance. Full diagnostics in seconds on every vehicle. Game changer for fleet ops.",
    car: "Fleet of 40+ vehicles",
  },
  {
    name: "Aiden Park",
    role: "Road Trip Enthusiast",
    initials: "AP",
    color: "from-cyan-500 to-blue-600",
    rating: 5,
    review:
      "Took it on a cross-country trip. Gave me peace of mind with live sensor monitoring. Caught an overheating issue before it became a problem. This device literally saved my trip.",
    car: "Ford F-150 2020",
  },
  {
    name: "Priya Sharma",
    role: "Tech Blogger",
    initials: "PS",
    color: "from-violet-600 to-purple-800",
    rating: 5,
    review:
      "As a tech reviewer, I'm hard to impress. OBDPro's app design is exceptional. The real-time data visualization is beautiful and the Bluetooth pairing is instant. 10/10.",
    car: "Toyota Camry 2022",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-bg-light overflow-hidden">
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
            Customer Reviews
          </span>
          <h2 className="section-title text-primary mb-4">
            Trusted by{" "}
            <span className="accent-text">50,000+ Drivers</span>
          </h2>
          <div className="flex justify-center items-center gap-2 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-gray-600 font-semibold ml-2">4.9 / 5.0 average</span>
          </div>
          <p className="text-gray-400 text-sm">Based on 12,400+ verified reviews</p>
        </motion.div>

        {/* Review cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Review text */}
              <p className="text-gray-600 leading-relaxed text-sm flex-1">
                "{t.review}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-primary text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role} · {t.car}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
