"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "What cars are supported by OBDPro?",
    a: "OBDPro works with virtually all gasoline and diesel vehicles manufactured after 1996 that comply with the OBD2 standard. This includes cars from Audi, BMW, Mercedes, Toyota, Honda, Volkswagen, Ford, Nissan, Hyundai, Kia, Porsche, Mazda, and 500+ more brands worldwide.",
  },
  {
    q: "Does it work with both Android and iPhone?",
    a: "Yes! OBDPro is fully compatible with iOS (iPhone 11 and newer) and Android (8.0+). The free companion app is available on both the Apple App Store and Google Play Store. Connection is via Bluetooth 5.0 or Wi-Fi.",
  },
  {
    q: "Do I need a subscription to use OBDPro?",
    a: "No subscription required for core features — fault code reading, live data, and basic diagnostics are free forever. The OBDPro Ultimate includes a lifetime license for all advanced features including car coding, ECU adaptation, and cloud sync.",
  },
  {
    q: "Is any installation or technical knowledge required?",
    a: "None at all. Simply plug the scanner into your car's OBD2 port (under the dashboard), open the app, and you're scanning in under 30 seconds. No wiring, no tools, no technical expertise needed.",
  },
  {
    q: "Will OBDPro work on hybrid or electric vehicles?",
    a: "Yes, OBDPro supports hybrid vehicles such as Toyota Prius, Honda Insight, and BMW i-series. For full EV support, the Pro and Ultimate models provide battery health monitoring and EV-specific diagnostics.",
  },
  {
    q: "What is the warranty and return policy?",
    a: "All OBDPro scanners come with a minimum 1-year hardware warranty (2 years for Pro, 3 years for Ultimate). We offer a 30-day no-questions-asked money-back guarantee. Simply contact our support team for a full refund.",
  },
  {
    q: "Can I use OBDPro to clear the check engine light?",
    a: "Absolutely. OBDPro reads and clears diagnostic trouble codes (DTCs) across all OBD2-compliant vehicles, including clearing the check engine light. It even provides a plain-English explanation of each code.",
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
            FAQ
          </span>
          <h2 className="section-title text-primary mb-4">
            Frequently Asked <span className="accent-text">Questions</span>
          </h2>
          <p className="text-gray-500">
            Everything you need to know about OBDPro Scanner.
          </p>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="rounded-2xl overflow-hidden border border-gray-100 hover:border-accent/30 transition-colors"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-bg-light transition-colors"
              >
                <span className="font-semibold text-primary">{faq.q}</span>
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-bg-light flex items-center justify-center">
                  {openIdx === i ? (
                    <Minus className="w-4 h-4 text-accent" />
                  ) : (
                    <Plus className="w-4 h-4 text-gray-400" />
                  )}
                </span>
              </button>

              <AnimatePresence>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-gray-500 leading-relaxed text-sm border-t border-gray-50 pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center p-8 rounded-2xl bg-bg-light"
        >
          <p className="text-primary font-semibold mb-2">Still have questions?</p>
          <p className="text-gray-500 text-sm mb-4">
            Our support team is available 24/7 to help you.
          </p>
          <a
            href="mailto:support@obdpro.com"
            className="inline-flex items-center gap-2 text-accent font-semibold text-sm hover:underline"
          >
            Contact Support →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
