import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Mail, Clock, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — BHARATI",
  description:
    "Get in touch with BHARATI. We are here to help with your orders, products, and questions.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-[var(--header-height)]">
      <div className="section-container section-spacing">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Contact Form Column (Desktop Left, Mobile Bottom) */}
          <div className="max-w-xl">
            <span className="text-label text-bharati-mint-dark mb-4 block font-medium">
              Get in Touch
            </span>
            <h1 className="text-headline text-bharati-black mb-8">Contact Us</h1>
            <p className="text-body-large text-bharati-ash mb-10">
              Have a question about our products? Need help with an order? We would
              love to hear from you. Reach out and our team will respond within 24
              hours.
            </p>

            {/* Contact form */}
            <form className="space-y-6 max-w-md">
              <div>
                <label className="text-label text-bharati-ash mb-2 block">
                  Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-bharati-ivory border border-bharati-mist text-bharati-charcoal text-[0.95rem] focus:outline-none focus:border-bharati-mint focus:ring-1 focus:ring-bharati-mint transition-colors duration-300"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-label text-bharati-ash mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-bharati-ivory border border-bharati-mist text-bharati-charcoal text-[0.95rem] focus:outline-none focus:border-bharati-mint focus:ring-1 focus:ring-bharati-mint transition-colors duration-300"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-label text-bharati-ash mb-2 block">
                  Message
                </label>
                <textarea
                  rows={5}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-bharati-ivory border border-bharati-mist text-bharati-charcoal text-[0.95rem] focus:outline-none focus:border-bharati-mint focus:ring-1 focus:ring-bharati-mint transition-colors duration-300 resize-none"
                  placeholder="Your message..."
                />
              </div>
              <button type="button" className="btn-primary">
                Send Message
              </button>
            </form>

            <div className="mt-14 pt-8 border-t border-bharati-mist/60">
              <Link
                href="/"
                className="text-[0.85rem] text-bharati-ash hover:text-bharati-black transition-colors duration-300 link-underline"
              >
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* Map Column (Desktop Right, Mobile Top via order-first lg:order-last) */}
          <div className="order-first lg:order-last flex flex-col gap-6">
            <div className="w-full h-[320px] sm:h-[380px] lg:h-[460px] rounded-2xl overflow-hidden border border-bharati-mist shadow-xs bg-bharati-ivory">
              <iframe
                src="https://maps.google.com/maps?q=26.7144636,88.4208267&hl=en&z=17&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bharati Location"
              />
            </div>

            {/* Address & Info Details Card */}
            <div className="p-6 rounded-2xl bg-bharati-ivory/80 border border-bharati-mist/60 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-bharati-mint-dark shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-bharati-charcoal text-sm">Headquarters & Works</h4>
                    <p className="text-xs text-bharati-ash font-light leading-relaxed mt-0.5">
                      BHARATI Cookware, Burdwan Road, Siliguri, West Bengal 734005, India
                    </p>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps/@26.7144636,88.4208267,17.77z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[0.75rem] font-medium text-bharati-mint-dark hover:underline inline-flex items-center gap-1 transition-colors"
                >
                  View on Maps
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-bharati-mist/40">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-bharati-mint-dark shrink-0" />
                  <span className="text-xs text-bharati-ash font-light">support@bharaticookware.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-bharati-mint-dark shrink-0" />
                  <span className="text-xs text-bharati-ash font-light">Mon - Sat, 9:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
