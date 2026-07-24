import Link from "next/link";
import {
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";

const contactDetails = [
  {
    title: "Email us",
    value: "support@maktyle.com",
    href: "mailto:support@maktyle.com",
    description: "For product, order, and customization questions.",
    icon: Mail,
  },
  {
    title: "WhatsApp",
    value: "+91 79707 31851",
    href: "https://wa.me/917970731851",
    description: "Chat with us for quick assistance.",
    icon: MessageCircle,
  },
  {
    title: "Visit us",
    value: "Jabalpur, Madhya Pradesh",
    href: "https://maps.google.com/?q=Jabalpur,Madhya+Pradesh",
    description: "Our personalized gifting service location.",
    icon: MapPin,
  },
];

const businessHours = [
  ["Monday – Saturday", "10:00 AM – 7:00 PM"],
  ["Sunday", "11:00 AM – 5:00 PM"],
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8549e8] via-[#a253dc] to-[#f36a47]">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-orange-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              <Sparkles size={16} />
              We are here to help
            </span>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-6xl">
              Contact Maktyle
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/80 sm:text-lg">
              Need help with an order, personalized design, bulk purchase, or
              product question? Send us a message and our team will get back to
              you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-8 ">
          {/* Contact information */}
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-[#8549e8]">
              Contact information
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Let’s talk about your gift
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-slate-600">
              Whether you need help choosing a product, uploading a design, or
              tracking an existing order, our support team is ready to assist.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {contactDetails.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    target={
                      item.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-[#8549e8] transition group-hover:bg-[#8549e8] group-hover:text-white">
                      <Icon size={22} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-500">
                        {item.title}
                      </p>

                      <p className="mt-1 font-black text-slate-950">
                        {item.value}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#f36a47]">
                  <Clock3 size={22} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Business hours
                  </p>
                  <h3 className="font-black">Customer support timings</h3>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {businessHours.map(([day, time]) => (
                  <div
                    key={day}
                    className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 text-sm last:border-none last:pb-0"
                  >
                    <span className="font-semibold text-slate-600">{day}</span>
                    <span className="font-bold text-slate-950">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          
        </div>
      </section>

      {/* Help cards */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-black sm:text-3xl">
              Looking for something else?
            </h2>

            <p className="mt-3 text-sm text-slate-500">
              These pages may help you find an answer faster.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
            <Link
              href="/dashboard"
              className="rounded-2xl border border-slate-200 p-6 text-center transition hover:border-purple-200 hover:bg-purple-50"
            >
              <p className="font-black">Track order</p>
              <p className="mt-2 text-sm text-slate-500">
                Check your current delivery status.
              </p>
            </Link>

            <Link
              href="/refund"
              className="rounded-2xl border border-slate-200 p-6 text-center transition hover:border-purple-200 hover:bg-purple-50"
            >
              <p className="font-black">Refund policy</p>
              <p className="mt-2 text-sm text-slate-500">
                Read our replacement and refund rules.
              </p>
            </Link>

            <Link
              href="/shop"
              className="rounded-2xl border border-slate-200 p-6 text-center transition hover:border-purple-200 hover:bg-purple-50"
            >
              <p className="font-black">Browse products</p>
              <p className="mt-2 text-sm text-slate-500">
                Explore all personalized gifts.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}