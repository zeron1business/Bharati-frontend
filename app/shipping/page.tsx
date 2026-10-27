import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  Zap,
  MapPin,
  PackageCheck,
  ReceiptText,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy — BHARATI",
  description:
    "Learn about BHARATI shipping timelines, delivery coverage, charges, and transit safety across India.",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen pt-[var(--header-height)] bg-bharati-cream/30">
      <div className="section-container section-spacing max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bharati-mint/10 border border-bharati-mint/20 mb-4">
            <span className="text-label text-bharati-mint-dark font-medium">
              Delivery & Fulfillment
            </span>
          </div>
          <h1 className="text-headline text-bharati-black mb-4">
            Shipping Policy
          </h1>
          <p className="text-body-large text-bharati-ash max-w-2xl mx-auto font-light mb-4">
            Every Bharati cookware piece is engineered for durability and packaged with high-grade protective insulation to ensure it arrives at your doorstep in pristine condition.
          </p>
          <span className="text-[0.75rem] uppercase tracking-wider text-bharati-silver">
            Last Updated: January 2025
          </span>
        </div>

        {/* Highlight Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {/* Card 1 — Dispatch */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-bharati-mist shadow-xs space-y-4 hover:border-bharati-mint/40 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-bharati-mint/10 flex items-center justify-center">
              <Zap size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">
              Fast 24–48 Hr Dispatch
            </h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              Standard orders are verified, securely boxed, and dispatched from our central facility within 1–2 business days.
            </p>
          </div>

          {/* Card 2 — Pan-India Reach */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-bharati-mist shadow-xs space-y-4 hover:border-bharati-mint/40 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-bharati-mint/10 flex items-center justify-center">
              <MapPin size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">
              Pan-India Coverage
            </h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              We partner with premier logistics providers (Delhivery, Bluedart, Ecom Express) covering 19,000+ PIN codes nationwide.
            </p>
          </div>

          {/* Card 3 — Free Shipping */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-bharati-mist shadow-xs space-y-4 hover:border-bharati-mint/40 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-bharati-mint/10 flex items-center justify-center">
              <PackageCheck size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">
              Free Shipping Over ₹999
            </h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              Enjoy complimentary shipping on all prepaid orders valued at ₹999 or above. Flat ₹79 fee applies on smaller orders.
            </p>
          </div>

          {/* Card 4 — Cash on Delivery */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-bharati-mist shadow-xs space-y-4 hover:border-bharati-mint/40 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-bharati-mint/10 flex items-center justify-center">
              <ReceiptText size={22} className="text-bharati-mint-dark" />
            </div>
            <h3 className="text-lg font-medium text-bharati-charcoal">
              Cash on Delivery (COD)
            </h3>
            <p className="text-sm text-bharati-ash font-light leading-relaxed">
              COD is supported for orders up to ₹5,000 in eligible zones with a nominal ₹50 handling charge.
            </p>
          </div>
        </div>

        {/* Detailed Sections (Stacked Cards) */}
        <div className="space-y-8 mb-16">
          {/* Section 1: Order Processing */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <Clock size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                1. Order Processing & Verification
              </h2>
            </div>
            <div className="space-y-4 text-sm text-bharati-ash font-light leading-relaxed">
              <p>
                All orders placed Monday through Saturday before <strong className="font-semibold text-bharati-charcoal">5:00 PM IST</strong> enter processing on the same business day. Orders placed after 5:00 PM IST, on Sundays, or during public gazetted holidays are processed on the subsequent operational business day.
              </p>
              <p>
                To avoid fraudulent activity or incorrect dispatch, high-value prepaid or COD orders may receive an automated WhatsApp confirmation or telephone verification before dispatch.
              </p>
            </div>
          </div>

          {/* Section 2: Delivery Timelines Table */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <Truck size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                2. Estimated Delivery Timelines
              </h2>
            </div>
            <p className="text-sm text-bharati-ash font-light leading-relaxed mb-6">
              Delivery timelines are counted from the moment your package is handed over to our courier partner:
            </p>

            {/* Timelines Table */}
            <div className="overflow-x-auto rounded-xl border border-bharati-mist/80 mb-6">
              <table className="w-full text-left text-sm">
                <thead className="bg-bharati-cream border-b border-bharati-mist/80">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold text-bharati-charcoal">Destination Region</th>
                    <th className="py-3.5 px-4 font-semibold text-bharati-charcoal">Coverage Cities</th>
                    <th className="py-3.5 px-4 font-semibold text-bharati-charcoal">Estimated Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bharati-mist/60 text-bharati-ash font-light">
                  <tr className="hover:bg-bharati-cream/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-bharati-charcoal">Tier-1 Metros</td>
                    <td className="py-3.5 px-4">Delhi NCR, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad, Pune</td>
                    <td className="py-3.5 px-4 text-bharati-mint-dark font-medium">2 – 4 Business Days</td>
                  </tr>
                  <tr className="hover:bg-bharati-cream/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-bharati-charcoal">Tier-2 Cities</td>
                    <td className="py-3.5 px-4">State capitals, major industrial hubs & tier-2 urban centres</td>
                    <td className="py-3.5 px-4 text-bharati-mint-dark font-medium">3 – 5 Business Days</td>
                  </tr>
                  <tr className="hover:bg-bharati-cream/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-bharati-charcoal">Rest of India</td>
                    <td className="py-3.5 px-4">Tier-3 towns, rural taluks, North-East states & J&K</td>
                    <td className="py-3.5 px-4 text-bharati-mint-dark font-medium">5 – 7 Business Days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-bharati-silver font-light">
              * Delivery timelines can be subject to unforeseen delays such as extreme weather conditions, regional festivals, or local transport restrictions.
            </p>
          </div>

          {/* Section 3: Shipping Rates */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <PackageCheck size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                3. Shipping Charges & Thresholds
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-bharati-ash font-light">
              <div className="p-4 rounded-xl bg-bharati-cream/50 border border-bharati-mist/60">
                <span className="font-semibold text-bharati-charcoal block mb-1">Prepaid Orders</span>
                <p>
                  Orders valued at <strong className="text-bharati-charcoal">₹999 and above</strong> ship for free. For orders under ₹999, a nominal flat rate of <strong className="text-bharati-charcoal">₹79</strong> applies.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-bharati-cream/50 border border-bharati-mist/60">
                <span className="font-semibold text-bharati-charcoal block mb-1">Cash on Delivery (COD)</span>
                <p>
                  A non-refundable handling fee of <strong className="text-bharati-charcoal">₹50</strong> is charged on COD orders to cover additional logistics verification.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Tracking & Delivery Attempts */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <ShieldCheck size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                4. Real-time Tracking & Delivery Attempts
              </h2>
            </div>
            <div className="space-y-4 text-sm text-bharati-ash font-light leading-relaxed">
              <p>
                As soon as your shipment is dispatched, you will receive an automated email and SMS notification containing your unique AWB tracking number and a direct live-tracking link. You can also monitor real-time shipment status at any time via our{" "}
                <Link
                  href="/track-order"
                  className="font-medium text-bharati-mint-dark hover:underline"
                >
                  Track Order page
                </Link>.
              </p>
              <p>
                Our delivery partner will make up to <strong className="text-bharati-charcoal font-semibold">three (3) delivery attempts</strong> before returning the package to our warehouse (RTO). In the event of a failed delivery due to incorrect contact details or customer unavailability, our support desk will contact you to arrange re-dispatch.
              </p>
            </div>
          </div>

          {/* Section 5: Transit Damage & Tamper Notice */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-bharati-mist shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-bharati-cream flex items-center justify-center">
                <AlertCircle size={18} className="text-bharati-mint-dark" />
              </div>
              <h2 className="text-subtitle text-bharati-black font-normal">
                5. Transit Damage & Tamper Protocols
              </h2>
            </div>
            <div className="space-y-4 text-sm text-bharati-ash font-light leading-relaxed">
              <p>
                All Bharati shipments are dispatched with tamper-evident security tape. If you notice that the outer parcel is torn, opened, or physically compromised upon arrival:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Do not accept the parcel or mention "Package Damaged/Tampered" on the courier delivery sheet.</li>
                <li>Capture clear photos or a quick unboxing video showing the shipping label and condition.</li>
                <li>
                  Notify our support team within <strong className="text-bharati-charcoal font-semibold">24 hours of delivery</strong> at{" "}
                  <a href="mailto:support@bharaticookware.com" className="text-bharati-mint-dark font-medium underline">
                    support@bharaticookware.com
                  </a>{" "}
                  with your order number. We will dispatch a free priority replacement immediately.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center bg-gradient-to-br from-bharati-ivory to-bharati-cream rounded-2xl p-10 sm:p-14 border border-bharati-mist/60 shadow-xs mb-12">
          <Truck size={36} className="text-bharati-mint-dark mx-auto mb-4" />
          <h3 className="text-lg font-medium text-bharati-charcoal mb-2">
            Have a question about an existing shipment?
          </h3>
          <p className="text-sm text-bharati-ash font-light mb-6 max-w-lg mx-auto">
            Our customer logistics desk is available Monday through Saturday (9:00 AM – 6:00 PM IST) to assist with live tracking or delivery instructions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/track-order" className="btn-primary inline-flex text-xs">
              Track Your Order
            </Link>
            <Link href="/contact" className="btn-secondary inline-flex text-xs">
              Contact Logistics
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
