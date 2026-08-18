"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Twitter, Instagram, Youtube, Facebook, Mail, Phone, MapPin, ArrowRight } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "Products", href: "#products" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Compatibility", href: "#compatibility" },
  { label: "FAQ", href: "#faq" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Refund Policy", href: "#" },
  { label: "Cookie Policy", href: "#" },
];

const socials = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Facebook, href: "#", label: "Facebook" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/newsletter`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      setSubscribed(true);
    } catch {
      setSubscribed(true); // still show success for UX
    }
    setLoading(false);
  };

  return (
    <footer className="bg-primary text-white">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <a href="#home" className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #00C2FF, #0099CC)" }}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                OBD<span className="text-accent">Pro</span>
              </span>
            </a>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Professional car diagnostics in your pocket. Trusted by 50,000+ drivers worldwide.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent/20 hover:text-accent transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-white/60 hover:text-accent text-sm transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-5">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <Mail className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <a href="mailto:support@obdpro.com" className="hover:text-accent transition-colors">
                  support@obdpro.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <Phone className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span>+1 (800) 627-3776</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span>123 Tech Park Drive<br />San Jose, CA 95110</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-5">Newsletter</h4>
            <p className="text-white/60 text-sm mb-4">
              Get updates on new features, car compatibility, and exclusive deals.
            </p>
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-accent/20 border border-accent/30 text-accent text-sm font-medium"
              >
                ✓ Thanks for subscribing!
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #00C2FF, #0099CC)" }}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} OBDPro Scanner. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            {legalLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-white/40 hover:text-accent text-xs transition-colors">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
