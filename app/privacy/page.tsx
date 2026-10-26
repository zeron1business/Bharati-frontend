import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  Eye,
  RefreshCw,
  FileText,
  Cookie,
  UserCheck,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — BHARATI",
  description:
    "Learn how BHARATI collects, utilizes, and protects your personal data when you shop with us.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-[var(--header-height)] bg-bharati-cream/30">
      <div className="section-container section-spacing max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bharati-mint/10 border border-bharati-mint/20 mb-4">
            <span className="text-label text-bharati-mint-dark font-medium">
              Data Protection & Trust
            </span>
          </div>
          <h1 className="text-headline text-bharati-black mb-4">
            Privacy Policy
          </h1>
          <p className="text-body-large text-bharati-ash max-w-2xl mx-auto font-light mb-4">
            At BHARATI, we respect your privacy and are committed to safeguarding your personal data. We collect only what is strictly necessary to provide an extraordinary cookware experience, and we never sell your information.
          </p>
          <span className="text-[0.75rem] uppercase tracking-wider text-bharati-silver">
            Last Updated: January 2025
          </span>
        </div>

        {/* Highlight Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {/* Card 1 — Minimal Collection */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-bharati-mist shadow-xs space-y-4 hover:border-bharati-mint/40 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-bharati-mint/10 flex items-center justify-center">
              <Lock size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">
              Essential Collection Only
            </h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              We gather only necessary contact, address, and transaction details required to process, bill, and deliver your orders.
            </p>
          </div>

          {/* Card 2 — Zero Data Selling */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-bharati-mist shadow-xs space-y-4 hover:border-bharati-mint/40 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-bharati-mint/10 flex items-center justify-center">
              <ShieldCheck size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">
              Zero Data Selling
            </h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              We never monetize, rent, or trade your personal records with external advertisers, data brokers, or marketing syndicates.
            </p>
          </div>

          {/* Card 3 — Transparent Tracking */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-bharati-mist shadow-xs space-y-4 hover:border-bharati-mint/40 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-bharati-mint/10 flex items-center justify-center">
              <Eye size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">
              Full Transparency
            </h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              Cookies and telemetry are strictly utilized to maintain your active cart, secure authentication, and evaluate site stability.
            </p>
          </div>

          {/* Card 4 — User Ownership */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-bharati-mist shadow-xs space-y-4 hover:border-bharati-mint/40 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-bharati-mint/10 flex items-center justify-center">
              <RefreshCw size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">
              Your Data Rights
            </h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              You retain the right to inspect, update, export, or request the irrevocable erasure of your customer profile at any time.
            </p>
          </div>
        </div>

        {/* Detailed Sections (Stacked Cards) */}
        <div className="space-y-8 mb-16">
          {/* Section 1: Information We Collect */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <FileText size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                1. Information We Collect
              </h2>
            </div>
            <div className="space-y-4 text-sm text-bharati-ash font-light leading-relaxed">
              <p>
                When you browse our digital storefront, register an account, or complete a purchase, we collect the following categories of information:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="font-semibold text-bharati-charcoal">Identity & Contact Data:</strong> Full name, email address, phone number, and physical billing/shipping addresses.
                </li>
                <li>
                  <strong className="font-semibold text-bharati-charcoal">Transactional Details:</strong> Items purchased, order history, invoice values, and payment status.
                </li>
                <li>
                  <strong className="font-semibold text-bharati-charcoal">Payment Security:</strong> Payment transactions are handled directly through RBI-authorized payment gateways (such as Razorpay). We never capture or store credit/debit card CVV numbers or banking passwords on our servers.
                </li>
                <li>
                  <strong className="font-semibold text-bharati-charcoal">Technical & Device Telemetry:</strong> Anonymized IP addresses, browser types, operating systems, and page interaction timestamps.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: How We Use Your Data */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <UserCheck size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                2. How We Utilize Your Data
              </h2>
            </div>
            <div className="space-y-4 text-sm text-bharati-ash font-light leading-relaxed">
              <p>Your personal information is used exclusively for lawful e-commerce operations, including:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Order verification, fulfillment, invoice generation, and courier coordination.</li>
                <li>Dispatching transactional notifications (order confirmation, dispatch alerts, and delivery OTPs).</li>
                <li>Managing warranty claims, product inquiries, and after-sales customer service.</li>
                <li>Protecting against unauthorized access, payment fraud, and platform misuse.</li>
                <li>Sending optional brand updates or new product releases (which you can opt out of at any time via a single click).</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Third-Party Disclosures */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <ShieldCheck size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                3. Third-Party Disclosures & Partners
              </h2>
            </div>
            <div className="space-y-4 text-sm text-bharati-ash font-light leading-relaxed">
              <p>
                We do not sell your personal information. We share relevant data only with vetted service providers who assist us in operating our storefront under strict non-disclosure obligations:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-bharati-cream/50 border border-bharati-mist/60">
                  <span className="font-semibold text-bharati-charcoal block mb-1">Logistics Partners</span>
                  <p className="text-xs">
                    Delhivery, Bluedart, and Ecom Express for physical doorstep delivery and SMS dispatch tracking.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-bharati-cream/50 border border-bharati-mist/60">
                  <span className="font-semibold text-bharati-charcoal block mb-1">Payment Gateways</span>
                  <p className="text-xs">
                    PCI-DSS compliant payment aggregators ensuring encrypted and secure online fund transfers.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-bharati-cream/50 border border-bharati-mist/60">
                  <span className="font-semibold text-bharati-charcoal block mb-1">Legal Authorities</span>
                  <p className="text-xs">
                    Disclosed solely when mandated by court summons, tax laws, or regulatory agencies under Indian statutes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Cookies & Storage */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <Cookie size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                4. Cookies & Web Storage
              </h2>
            </div>
            <div className="space-y-4 text-sm text-bharati-ash font-light leading-relaxed">
              <p>
                Our web application uses essential cookies and local browser storage to keep track of your shopping cart contents, preserve customer login sessions, and optimize content delivery speeds. You can configure your browser to reject cookies, though certain interactive features (such as cart persistence) may function suboptimally.
              </p>
            </div>
          </div>

          {/* Section 5: Security & Grievance Redressal */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <Lock size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                5. Data Security & Grievance Officer
              </h2>
            </div>
            <div className="space-y-4 text-sm text-bharati-ash font-light leading-relaxed">
              <p>
                We maintain robust 256-bit TLS encryption in transit and end-to-end encrypted databases at rest to defend against unauthorized access, modification, or exposure.
              </p>
              <p>
                In accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act (DPDPA), the contact details for our Grievance Redressal Officer are:
              </p>
              <div className="p-4 rounded-xl bg-bharati-cream/50 border border-bharati-mist/60 text-xs text-bharati-charcoal leading-relaxed space-y-1">
                <p><strong>Grievance Officer:</strong> BHARATI Compliance & Legal Cell</p>
                <p><strong>Address:</strong> BHARATI Cookware, Burdwan Road, Siliguri, West Bengal 734005, India</p>
                <p><strong>Email:</strong> privacy@bharaticookware.com</p>
                <p><strong>Response Time:</strong> Within 48 business hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center bg-gradient-to-br from-bharati-ivory to-bharati-cream rounded-2xl p-10 sm:p-14 border border-bharati-mist/60 shadow-xs mb-12">
          <Mail size={36} className="text-bharati-mint-dark mx-auto mb-4" />
          <h3 className="text-lg font-medium text-bharati-charcoal mb-2">
            Questions regarding your personal information?
          </h3>
          <p className="text-sm text-bharati-ash font-light mb-6 max-w-lg mx-auto">
            Our data privacy team is on hand to assist with data inquiries, access copies, or account de-registration.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact" className="btn-primary inline-flex text-xs">
              Contact Privacy Team
            </Link>
            <Link href="/terms" className="btn-secondary inline-flex text-xs">
              View Terms of Service
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
