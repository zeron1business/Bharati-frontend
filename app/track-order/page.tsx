import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Track Order — BHARATI",
  description:
    "Track your BHARATI order status. Enter your order number to get real-time updates.",
};

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen pt-[var(--header-height)]">
      <div className="section-container section-spacing">
        <div className="max-w-2xl">
          <span className="text-label text-bharati-silver mb-4 block">
            Order Tracking
          </span>
          <h1 className="text-headline text-bharati-black mb-8">
            Track your order
          </h1>
          <p className="text-body-large text-bharati-ash mb-12">
            Enter your order number below to check the status of your delivery.
          </p>

          {/* Placeholder tracking form */}
          <div className="max-w-md">
            <div className="flex gap-3">
              <input
                type="text"
                className="flex-1 px-4 py-3 bg-bharati-ivory border border-bharati-mist text-bharati-charcoal text-[0.95rem] focus:outline-none focus:border-bharati-charcoal transition-colors duration-300"
                placeholder="Order number"
              />
              <button className="btn-primary">Track</button>
            </div>

            <p className="text-[0.8rem] text-bharati-silver mt-4">
              You can find your order number in the confirmation email sent after
              your purchase.
            </p>
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
