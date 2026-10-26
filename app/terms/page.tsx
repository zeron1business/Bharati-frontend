import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Truck,
  RotateCcw,
  Scale,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — BHARATI",
  description:
    "Read the terms and conditions governing your use of BHARATI cookware and online store purchases.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-[var(--header-height)] bg-bharati-cream/30">
      <div className="section-container section-spacing max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bharati-mint/10 border border-bharati-mint/20 mb-4">
            <span className="text-label text-bharati-mint-dark font-medium">
              Legal Agreement
            </span>
          </div>
          <h1 className="text-headline text-bharati-black mb-4">
            Terms of Service
          </h1>
          <p className="text-body-large text-bharati-ash max-w-2xl mx-auto font-light mb-4">
            These Terms of Service govern your access to BHARATI&apos;s online storefront, digital services, and purchase of our cookware. By exploring our website or placing an order, you agree to be bound by these terms.
          </p>
          <span className="text-[0.75rem] uppercase tracking-wider text-bharati-silver">
            Last Updated: January 2025
          </span>
        </div>

        {/* Highlight Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {/* Card 1 — Ordering */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-bharati-mist shadow-xs space-y-4 hover:border-bharati-mint/40 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-bharati-mint/10 flex items-center justify-center">
              <FileText size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">
              Transparent Orders
            </h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              Clear pricing in INR (all taxes inclusive), transparent specifications, and digital tax invoices for every purchase.
            </p>
          </div>

          {/* Card 2 — Delivery */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-bharati-mist shadow-xs space-y-4 hover:border-bharati-mint/40 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-bharati-mint/10 flex items-center justify-center">
              <Truck size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">
              Safe Delivery & Risk
            </h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              Shipment title and risk of loss transfer upon successful delivery confirmation or delivery OTP authentication.
            </p>
          </div>

          {/* Card 3 — Returns & Warranty */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-bharati-mist shadow-xs space-y-4 hover:border-bharati-mint/40 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-bharati-mint/10 flex items-center justify-center">
              <RotateCcw size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">
              Warranty & Returns
            </h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              Enjoy our customer assurance with 7-day returns and comprehensive manufacturer warranty on all cookware.
            </p>
          </div>

          {/* Card 4 — Governing Law */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-bharati-mist shadow-xs space-y-4 hover:border-bharati-mint/40 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-bharati-mint/10 flex items-center justify-center">
              <Scale size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">
              Governing Law
            </h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              Operated in compliance with Indian consumer protection statutes under the jurisdiction of West Bengal courts.
            </p>
          </div>
        </div>

        {/* Detailed Sections (Stacked Cards) */}
        <div className="space-y-8 mb-16">
          {/* Section 1: Acceptance & Eligibility */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <CheckCircle size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                1. Acceptance of Terms & Eligibility
              </h2>
            </div>
            <div className="space-y-4 text-sm text-bharati-ash font-light leading-relaxed">
              <p>
                By accessing this platform, creating an account, or placing an order with <strong className="text-bharati-charcoal font-semibold">BHARATI Cookware</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you acknowledge that you are at least 18 years of age (or accessing under parental supervision) and legally competent to enter into this contract under the Indian Contract Act, 1872.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for restricting unauthorized access to your account devices.
              </p>
            </div>
          </div>

          {/* Section 2: Products & Pricing */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <FileText size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                2. Product Descriptions, Pricing & Availability
              </h2>
            </div>
            <div className="space-y-4 text-sm text-bharati-ash font-light leading-relaxed">
              <p>
                We strive for meticulous accuracy in product images, volume measurements, materials, and induction compatibility notes. However, minor variations in finish or handcrafted aspects may occur due to the artisanal manufacturing techniques employed in our premium tri-ply and cast cookware lines.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>All prices are listed in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST).</li>
                <li>Prices and promotional offers are subject to change without prior notice, but will not affect orders already confirmed.</li>
                <li>In the unlikely event of an inadvertent technical pricing glitch, we reserve the right to cancel the order and issue an immediate full refund.</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Payments & Verification */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <ShieldCheck size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                3. Payment Methods & Verification
              </h2>
            </div>
            <div className="space-y-4 text-sm text-bharati-ash font-light leading-relaxed">
              <p>
                We accept payments through major Credit/Debit Cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD) in eligible service areas. All card transactions are routed through 3D-secure RBI-regulated gateways with full end-to-end tokenization.
              </p>
              <p>
                We reserve the right to decline or cancel transactions suspected of payment fraud, identity spoofing, or unauthorized card usage.
              </p>
            </div>
          </div>

          {/* Section 4: Shipping & Returns Policies */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <Truck size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                4. Fulfillment, Returns & Warranty
              </h2>
            </div>
            <div className="space-y-4 text-sm text-bharati-ash font-light leading-relaxed">
              <p>
                Orders are processed and dispatched according to our{" "}
                <Link href="/shipping" className="text-bharati-mint-dark font-medium underline">
                  Shipping Policy
                </Link>. Risk of loss transfers upon verified doorstep delivery.
              </p>
              <p>
                Returns, replacements, and warranty service requests are governed by our{" "}
                <Link href="/returns" className="text-bharati-mint-dark font-medium underline">
                  Return & Exchange Policy
                </Link>. Bharati cookware is covered against verified manufacturing defects. Damage caused by improper domestic usage, thermal shock (e.g. running cold water over red-hot cast iron), or unauthorized alterations is excluded.
              </p>
            </div>
          </div>

          {/* Section 5: Intellectual Property */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <Scale size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                5. Intellectual Property & Brand Rights
              </h2>
            </div>
            <div className="space-y-4 text-sm text-bharati-ash font-light leading-relaxed">
              <p>
                All trademarks, logos, brand emblems, packaging designs, product photography, and website content displayed on this website are the proprietary property of <strong className="text-bharati-charcoal font-semibold">BHARATI Cookware</strong>.
              </p>
              <p>
                Unauthorized copying, scraping, reproduction, reverse engineering, or commercial exploitation of any material without our explicit prior written consent is strictly prohibited.
              </p>
            </div>
          </div>

          {/* Section 6: Limitation of Liability & Jurisdiction */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <AlertTriangle size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                6. Limitation of Liability & Jurisdiction
              </h2>
            </div>
            <div className="space-y-4 text-sm text-bharati-ash font-light leading-relaxed">
              <p>
                To the maximum extent permitted by applicable Indian law, BHARATI shall not be liable for any indirect, incidental, or consequential damages resulting from product misuse or failure to heed safety instructions detailed in user manuals. In all circumstances, our aggregate liability shall not exceed the purchase price paid for the specific product in contention.
              </p>
              <p>
                These Terms are governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in <strong className="text-bharati-charcoal font-semibold">Siliguri, West Bengal, India</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center bg-gradient-to-br from-bharati-ivory to-bharati-cream rounded-2xl p-10 sm:p-14 border border-bharati-mist/60 shadow-xs mb-12">
          <HelpCircle size={36} className="text-bharati-mint-dark mx-auto mb-4" />
          <h3 className="text-lg font-medium text-bharati-charcoal mb-2">
            Have questions about our terms or services?
          </h3>
          <p className="text-sm text-bharati-ash font-light mb-6 max-w-lg mx-auto">
            Our customer relations team is glad to clarify any terms, wholesale inquiries, or product warranties.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact" className="btn-primary inline-flex text-xs">
              Contact Us
            </Link>
            <Link href="/privacy" className="btn-secondary inline-flex text-xs">
              Read Privacy Policy
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-6 border-t border-bharati-mist/60">
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
