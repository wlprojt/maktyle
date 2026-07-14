import Link from "next/link";

const eligibilityItems = [
  "The product arrived damaged or broken.",
  "The product has a manufacturing or printing defect.",
  "You received a product different from the item ordered.",
  "The customization is materially different from the approved design or order details.",
  "An item or accessory included in the order is missing.",
];

const nonEligibilityItems = [
  "The customer entered an incorrect name, date, message, size, address, or other personalization detail.",
  "The customer uploaded a low-quality, blurred, dark, cropped, or incorrectly oriented image.",
  "Minor colour differences caused by screen settings, lighting, materials, or printing processes.",
  "The customer changed their mind after production began.",
  "Normal wear and tear, accidental damage, or misuse after delivery.",
  "The request was submitted without the required photographs, video, or order information.",
];

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#faf9fc] px-5 py-12 sm:px-8">
      <article className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-purple-100 bg-white shadow-[0_24px_80px_rgba(76,29,149,0.08)]">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#fff7f2] via-[#f8efff] to-[#eee7ff] px-6 py-12 sm:px-10 md:px-14">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
            Maktyle Policies
          </p>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Refund &amp; Cancellation Policy
          </h1>

          <p className="mt-4 text-slate-600">Last updated: July 2026</p>
        </header>

        <div className="space-y-10 px-6 py-10 leading-8 text-slate-700 sm:px-10 md:px-14">
          <section>
            <h2 className="text-2xl font-bold text-slate-900">
              1. Overview
            </h2>

            <p className="mt-3">
              At Maktyle, most products are created specifically using the
              photographs, names, messages and design choices provided by the
              customer. We therefore cannot ordinarily accept returns or
              exchanges for a change of mind once production has started.
            </p>

            <p className="mt-3">
              We will, however, review and resolve eligible claims involving
              damaged, defective, missing, incorrect or improperly customized
              products.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">
              2. Order Cancellation
            </h2>

            <p className="mt-3">
              You may request cancellation before your order enters production.
              Contact us as soon as possible and include your order number.
            </p>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-semibold text-amber-950">
                Once customization, printing, engraving, cutting, packaging or
                another production process has begun, the order may no longer
                be cancellable.
              </p>
            </div>

            <p className="mt-4">
              If cancellation is approved, any applicable refund will be sent
              to the original payment method. Payment gateway or processing
              charges may be deducted only where permitted and clearly
              disclosed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">
              3. Eligible Return or Replacement Cases
            </h2>

            <p className="mt-3">
              You may request a replacement or refund when:
            </p>

            <ul className="mt-4 space-y-3">
              {eligibilityItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">
              4. Cases Normally Not Eligible
            </h2>

            <p className="mt-3">
              A return, replacement or refund may be declined when:
            </p>

            <ul className="mt-4 space-y-3">
              {nonEligibilityItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                    ×
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-sm text-slate-500">
              Nothing in this policy limits any non-excludable right available
              under applicable consumer law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">
              5. Reporting an Issue
            </h2>

            <p className="mt-3">
              Please contact us within <strong>48 hours of delivery</strong>.
              Keep the product and original packaging until the claim is
              resolved.
            </p>

            <p className="mt-3">Your request should include:</p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Your order number and registered contact details.</li>
              <li>A clear description of the issue.</li>
              <li>
                Clear photographs of the product, defect and outer packaging.
              </li>
              <li>
                An unboxing video where available, particularly for damaged,
                missing or incorrect items.
              </li>
              <li>
                A photograph of the shipping label and product label, where
                applicable.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">
              6. Inspection and Resolution
            </h2>

            <p className="mt-3">
              After receiving the required evidence, we will inspect the claim
              and contact you with the outcome. Depending on the circumstances,
              we may offer:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>A replacement of the same product.</li>
              <li>Correction or reprinting of the customized product.</li>
              <li>A partial refund for a minor accepted issue.</li>
              <li>A full refund for an eligible claim.</li>
              <li>Store credit, where accepted by the customer.</li>
            </ul>

            <p className="mt-4">
              Where a replacement is approved, Maktyle will generally bear the
              reasonable replacement and shipping cost.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">
              7. Returning an Approved Product
            </h2>

            <p className="mt-3">
              Do not return a product without receiving return instructions
              from Maktyle. Unauthorized returns may not be accepted.
            </p>

            <p className="mt-3">
              Where a physical return is required, the product should be
              securely packed with its original accessories and packaging.
              Pickup availability may depend on your location and courier
              coverage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">
              8. Refund Processing
            </h2>

            <p className="mt-3">
              Once approved, we will initiate the refund to the original payment
              method. Bank, card, UPI and payment-gateway processing times may
              vary.
            </p>

            <p className="mt-3">
              Cash-on-delivery refunds, where applicable, may require verified
              bank or UPI details. Never send card PINs, OTPs or complete card
              credentials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">
              9. Failed or Duplicate Payments
            </h2>

            <p className="mt-3">
              If money was deducted but an order was not confirmed, first check
              your order history and payment status. Failed or reversed
              transactions may be automatically returned by the payment
              provider.
            </p>

            <p className="mt-3">
              For duplicate or unresolved charges, contact us with the payment
              reference number, date, amount and a redacted transaction
              screenshot.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">
              10. Incorrect Delivery Address
            </h2>

            <p className="mt-3">
              Customers are responsible for checking their delivery address
              before placing an order. Contact us immediately if a correction
              is needed.
            </p>

            <p className="mt-3">
              Additional delivery charges may apply when an order must be
              reshipped because of an incomplete or incorrect address, an
              unavailable recipient, or repeated failed delivery attempts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">
              11. Contact Us
            </h2>

            <div className="mt-4 rounded-2xl bg-purple-50 p-6">
              <p className="font-bold text-slate-900">Maktyle Support</p>
              <p className="mt-2">
                Email:{" "}
                <a
                  href="mailto:support@maktyle.com"
                  className="font-semibold text-purple-600 hover:underline"
                >
                  support@maktyle.com
                </a>
              </p>
              <p>Phone: +91-XXXXXXXXXX</p>
              <p>Jabalpur, Madhya Pradesh, India</p>
              <p className="mt-2">Support hours: Monday–Saturday, 10 AM–6 PM</p>
            </div>
          </section>

          <div className="border-t border-slate-200 pt-8 text-sm text-slate-500">
            <p>
              Please also review our{" "}
              <Link
                href="/terms"
                className="font-semibold text-purple-600 hover:underline"
              >
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-semibold text-purple-600 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}