import {
  Search,
  User,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="mx-auto flex h-[88px] max-w-7xl items-center justify-between px-6">
        
        {/* Logo */}
        <Link href="/">
        <Image
              src="/maktyle.png"
              alt="Logo"
              width={400}
              height={400}
              className="w-35 h-17 md:w-40 md:h-20"
            />
        </Link>

        {/* Menu */}
        <nav className="hidden items-center gap-10 text-sm font-medium text-gray-900 md:flex">
          <a className="relative text-purple-600" href="#">
            Home
            <span className="absolute -bottom-[31px] left-0 h-[3px] w-full rounded-full bg-purple-600" />
          </a>

          <a href="#">Shop</a>

          <a href="#">Design Your Gift</a>

          <button className="flex items-center gap-1">
            Occasions
            <ChevronDown size={16} />
          </button>

          <a href="#">Bulk Orders</a>

          <a href="#">Track Order</a>
        </nav>

        {/* Icons */}
        <div className="flex items-center text-gray-700 gap-6">
          <button>
            <Search size={25} strokeWidth={2} />
          </button>

          <button>
            <User size={25} strokeWidth={2} />
          </button>

          <button className="relative">
            <ShoppingCart size={26} strokeWidth={2} />
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
              0
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}