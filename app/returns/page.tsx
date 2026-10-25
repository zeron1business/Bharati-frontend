import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Package, RefreshCw, Clock, ShieldCheck, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Return & Exchange — BHARATI",
  description: "Hassle-free returns and exchanges for all Bharati cookware products. Read our complete return policy.",
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen pt-[var(--header-height)] bg-bharati-cream/30">
      <div className="section-container section-spacing max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-label text-bharati-mint-dark mb-4 block font-medium">
            Customer Assurance
          </span>
          <h1 className="text-headline text-bharati-black mb-4">
            Return & Exchange Policy
          </h1>
          <p className="text-body-large text-bharati-ash max-w-2xl mx-auto font-light">
            We stand behind the quality of every Bharati product. If you are not
            completely satisfied, we make the return process simple and hassle-free.
          </p>
        </div>

        {/* Policy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Card 1 — Return Window */}
          <div className="bg-white rounded-2xl p-8 border border-bharati-mist shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-bharati-mint/10 flex items-center justify-center">
              <Clock size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">7-Day Return Window</h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              Products can be returned within 7 days of delivery. Items must be unused,
              in their original packaging, and accompanied by the invoice.
            </p>
          </div>

          {/* Card 2 — Exchange */}
          <div className="bg-white rounded-2xl p-8 border border-bharati-mist shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-bharati-mint/10 flex items-center justify-center">
              <RefreshCw size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">Easy Exchange</h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              Want a different size or variant? Exchanges are processed within 3-5
              business days of receiving the returned item.
            </p>
          </div>

          {/* Card 3 — Damaged Items */}
          <div className="bg-white rounded-2xl p-8 border border-bharati-mist shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-bharati-mint/10 flex items-center justify-center">
              <Package size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">Damaged or Defective</h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              Received a damaged or defective product? Contact us immediately with
              photos and your order number for a free replacement or full refund.
            </p>
          </div>

          {/* Card 4 — Warranty */}
          <div className="bg-white rounded-2xl p-8 border border-bharati-mist shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-bharati-mint/10 flex items-center justify-center">
              <ShieldCheck size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">Warranty Coverage</h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              All Bharati products come with a manufacturer warranty. Manufacturing
              defects are covered — normal wear and tear is excluded.
            </p>
          </div>
        </div>

        {/* How to Initiate a Return */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs mb-16">
          <h2 className="text-subtitle text-bharati-black mb-8">How to Initiate a Return</h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Contact Us",
                desc: "Email us at support@bharaticookware.com or reach out via our contact page with your order number and issue details.",
              },
              {
                step: "2",
                title: "Ship or Handover the Product",
                desc: "Pack the item securely in its original packaging. We will coordinate a doorstep reverse pickup or provide a prepaid shipping label.",
              },
              {
                step: "3",
                title: "Inspection & Refund/Exchange",
                desc: "Once we receive and inspect the item, your refund will be processed within 5-7 business days to your original payment method, or a replacement will be dispatched.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-5">
                <div className="w-10 h-10 rounded-full bg-bharati-mint text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-medium text-bharati-charcoal mb-1">{item.title}</h4>
                  <p className="text-sm text-bharati-ash font-light leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center bg-gradient-to-br from-bharati-ivory to-bharati-cream rounded-2xl p-10 sm:p-14 border border-bharati-mist/60 shadow-xs">
          <Mail size={32} className="text-bharati-mint-dark mx-auto mb-4" />
          <h3 className="text-lg font-medium text-bharati-charcoal mb-2">
            Still have questions?
          </h3>
          <p className="text-sm text-bharati-ash font-light mb-6">
            Our support team is available to assist you with any return or exchange queries.
          </p>
          <Link href="/contact" className="btn-primary inline-flex text-sm">
            Contact Support
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-bharati-mist/60">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-wider text-bharati-ash hover:text-bharati-black transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
