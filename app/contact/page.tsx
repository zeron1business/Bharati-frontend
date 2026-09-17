import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact — BHARATI",
  description:
    "Get in touch with BHARATI. We are here to help with your orders, products, and questions.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-[var(--header-height)]">
      <div className="section-container section-spacing">
        <div className="max-w-2xl">
          <span className="text-label text-bharati-mint-dark mb-4 block font-medium">
            Get in Touch
          </span>
          <h1 className="text-headline text-bharati-black mb-8">Contact Us</h1>
          <p className="text-body-large text-bharati-ash mb-12">
            Have a question about our products? Need help with an order? We would
            love to hear from you. Reach out and our team will respond within 24
            hours.
          </p>

          {/* Placeholder contact form */}
          <div className="space-y-6 max-w-md">
            <div>
              <label className="text-label text-bharati-ash mb-2 block">
                Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-bharati-ivory border border-bharati-mist text-bharati-charcoal text-[0.95rem] focus:outline-none focus:border-bharati-mint focus:ring-1 focus:ring-bharati-mint transition-colors duration-300"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-label text-bharati-ash mb-2 block">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-bharati-ivory border border-bharati-mist text-bharati-charcoal text-[0.95rem] focus:outline-none focus:border-bharati-mint focus:ring-1 focus:ring-bharati-mint transition-colors duration-300"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-label text-bharati-ash mb-2 block">
                Message
              </label>
              <textarea
                rows={5}
                className="w-full px-4 py-3 bg-bharati-ivory border border-bharati-mist text-bharati-charcoal text-[0.95rem] focus:outline-none focus:border-bharati-mint focus:ring-1 focus:ring-bharati-mint transition-colors duration-300 resize-none"
                placeholder="Your message..."
              />
            </div>
            <button className="btn-primary">Send Message</button>
          </div>

          <div className="mt-16 pt-10 border-t border-bharati-mist">
            <Link
              href="/"
              className="text-[0.85rem] text-bharati-ash hover:text-bharati-black transition-colors duration-300 link-underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
