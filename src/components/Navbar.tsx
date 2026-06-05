import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import deemLogo from "@/assets/deem-logo.jpg";
import EnquiryDialog from "@/components/EnquiryDialog";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const links = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "About", href: "/#about" },
    { label: "Partners", href: "/#partners" },
    { label: "Services", href: "/#services" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <a href="/" className="flex items-center">
              <img src={deemLogo} alt="Deem Medical Technology" className="h-14 w-auto" />
            </a>

            <div className="hidden lg:flex items-center gap-8">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <a href="tel:+966XXXXXXXXX" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-4 h-4" />
                +966 XX XXX XXXX
              </a>
              <Button size="sm" onClick={() => setEnquiryOpen(true)}>Get a Quote</Button>
            </div>

            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {isOpen && (
            <div className="lg:hidden pb-4 border-t border-border pt-4 space-y-3">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Button size="sm" className="w-full mt-2" onClick={() => { setIsOpen(false); setEnquiryOpen(true); }}>Get a Quote</Button>
            </div>
          )}
        </div>
      </nav>
      <EnquiryDialog open={enquiryOpen} onOpenChange={setEnquiryOpen} />
    </>
  );
};

export default Navbar;
