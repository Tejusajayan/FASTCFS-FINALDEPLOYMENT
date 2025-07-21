import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Package, Phone } from "lucide-react";
import fastCfsLogo from "@assets/FAST CFS Logo - PNG_1752129714357.png";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Blog", href: "/blog" },
  { name: "Air Cargo Tracking", href: "/cargo-tracking" },
  { name: "Branches", href: "/branches" },
  { name: "FAQ", href: "/faq" }, // FAQ before Contact
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <div className="flex items-center space-x-2">
                <img src={fastCfsLogo} alt="FAST CFS" className="h-8 w-auto" />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-8">
              {navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                    className={`text-sm font-medium transition-colors hover:text-fast-blue ${
                      isActive
                        ? "text-fast-blue border-b-2 border-fast-blue pb-1"
                        : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/cargo-tracking" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
              <Button variant="outline" size="sm" className="text-fast-blue border-fast-blue hover:bg-fast-blue hover:text-white font-medium">
                <Package className="h-4 w-4 mr-2" />
                Track Cargo
              </Button>
            </Link>
            <Link href="/contact" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
              <Button size="sm" className="bg-fast-blue hover:bg-fast-blue-dark text-white font-medium">
                <Phone className="h-4 w-4 mr-2" />
                Contact Us
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-lg font-medium transition-colors ${
                          isActive ? "text-fast-blue" : "text-gray-700 hover:text-fast-blue"
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                  <div className="pt-4 border-t space-y-2">
                    <Link href="/cargo-tracking" onClick={() => {
                      setIsOpen(false);
                      window.scrollTo({ top: 0, behavior: "instant" });
                    }}>
                      <Button variant="outline" className="w-full text-fast-blue border-fast-blue font-medium">
                        <Package className="h-4 w-4 mr-2" />
                        Track Cargo
                      </Button>
                    </Link>
                    <Link href="/contact" onClick={() => {
                      setIsOpen(false);
                      window.scrollTo({ top: 0, behavior: "instant" });
                    }}>
                      <Button className="w-full bg-fast-blue hover:bg-fast-blue-dark text-white font-medium">
                        <Phone className="h-4 w-4 mr-2" />
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
