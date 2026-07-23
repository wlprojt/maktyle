"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white">

      {/* Footer */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div>
          {/* <h2 className="text-4xl font-extrabold">
            <span className="text-white">mak</span>
            <span className="text-purple-500">tyle</span>
          </h2> */}

          {/* Logo */}
        <Link href="/">
        <Image
              src="/wmaktyle.png"
              alt="Logo"
              width={400}
              height={400}
              className="w-40 h-10"
            />
        </Link>

          <p className="mt-5 leading-7 text-slate-300">
            Personalized gifts crafted with love. Create memorable moments
            through unique custom products.
          </p>

          <div className="mt-6 flex gap-4">
            {[FaFacebookF, FaInstagram, FaXTwitter, FaYoutube].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="rounded-full bg-white/10 p-3 transition hover:bg-purple-600"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-5 text-xl font-bold">Quick Links</h3>

          <ul className="space-y-3 text-slate-300">
            <li>
              <Link href="/" className="hover:text-purple-400">
                Home
              </Link>
            </li>

            <li>
              <Link href="/shop" className="hover:text-purple-400">
                Shop
              </Link>
            </li>

            <li>
              <Link href="/design" className="hover:text-purple-400">
                Design Your Gift
              </Link>
            </li>

            <li>
              <Link href="/bulk-orders" className="hover:text-purple-400">
                Bulk Orders
              </Link>
            </li>

            <li>
              <Link href="/track-order" className="hover:text-purple-400">
                Track Order
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="mb-5 text-xl font-bold">Categories</h3>

          <ul className="space-y-3 text-slate-300">
            <li>Photo Frames</li>
            <li>Custom Mugs</li>
            <li>LED Lamps</li>
            <li>Phone Cases</li>
            <li>T-Shirts</li>
            <li>Gift Boxes</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-5 text-xl font-bold">Contact Us</h3>

          <div className="space-y-5 text-slate-300">
            <div className="flex gap-3">
              <MapPin className="mt-1 text-purple-400" size={18} />
              <p>Jabalpur, Madhya Pradesh, India</p>
            </div>

            <div className="flex gap-3">
              <Phone className="text-purple-400" size={18} />
              <p>+91 7970731851</p>
            </div>

            <div className="flex gap-3">
              <Mail className="text-purple-400" size={18} />
              <p>support@maktyle.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-sm text-slate-400 lg:flex-row lg:px-8">
          <p>© 2026 Maktyle. All Rights Reserved.</p>

          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-purple-400">
              Privacy Policy
            </Link>

            <Link href="/terms" className="hover:text-purple-400">
              Terms & Conditions
            </Link>

            <Link href="/refund" className="hover:text-purple-400">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}