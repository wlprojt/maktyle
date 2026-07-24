"use client";

import {
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import CartCount from "./cart-count";

const menuItems = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Shop",
    href: "/shop",
  },
  {
    label: "Occasions",
    href: "/search#occasions",
  },
  {
    label: "Bulk Orders",
    href: "/contact?subject=bulk-order",
  },
  {
    label: "Track Order",
    href: "/dashboard/orders",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function isActive(href: string) {
    const cleanHref = href.split("?")[0].split("#")[0];

    if (cleanHref === "/") {
      return pathname === "/";
    }

    return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white shadow-sm">
      <div className="mx-auto flex h-[88px] max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" aria-label="Maktyle home">
          <Image
            src="/maktyle.png"
            alt="Maktyle"
            width={400}
            height={400}
            priority
            className="h-16 w-auto object-contain md:h-20"
          />
        </Link>

        {/* Desktop menu */}
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 lg:flex">
          {menuItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex h-[88px] items-center transition ${
                  active
                    ? "text-[#8549e8]"
                    : "hover:text-[#8549e8]"
                }`}
              >
                {item.label}

                {active && (
                  <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-full bg-[#8549e8]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-2 text-slate-700 sm:gap-4">
          <Link
            href="/search"
            aria-label="Search products"
            className="rounded-full p-2 transition hover:bg-purple-50 hover:text-[#8549e8]"
          >
            <Search size={24} strokeWidth={2} />
          </Link>

          <Link
            href="/dashboard"
            aria-label="My account"
            className="rounded-full p-2 transition hover:bg-purple-50 hover:text-[#8549e8]"
          >
            <User size={24} strokeWidth={2} />
          </Link>

          <CartCount />

          {/* Mobile menu button */}
          {/* <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            className="rounded-full p-2 transition hover:bg-purple-50 hover:text-[#8549e8] lg:hidden"
          >
            {mobileMenuOpen ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}
          </button> */}
        </div>
      </div>

      {/* Mobile menu */}
      {/* {mobileMenuOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {menuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-purple-50 text-[#8549e8]"
                      : "text-slate-700 hover:bg-slate-50 hover:text-[#8549e8]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                pathname === "/contact"
                  ? "bg-purple-50 text-[#8549e8]"
                  : "text-slate-700 hover:bg-slate-50 hover:text-[#8549e8]"
              }`}
            >
              Contact Us
            </Link>
          </div>
        </nav>
      )} */}
    </header>
  );
}