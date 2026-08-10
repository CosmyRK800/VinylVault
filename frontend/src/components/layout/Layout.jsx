import Navbar from "./Navbar"
import GDPRBanner from "../ui/GDPRBanner"
import NewsletterForm from "../ui/NewsletterForm"
import { Link } from "react-router-dom"

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4">

          {/* Newsletter section */}
          <div className="mb-12">
            <NewsletterForm variant="hero" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="text-xl font-black mb-3 inline-block">
                <span className="text-red-500">Vinyl</span><span className="text-white">Vault</span>
              </Link>
              <p className="text-gray-500 text-sm mb-3">Muzică fizică pentru suflete reale.</p>
              <p className="text-gray-600 text-xs">VinylVault SRL · CUI RO12345678</p>
              <p className="text-gray-600 text-xs mt-1">contact@vinylvault.ro</p>
            </div>

            {/* Magazin */}
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Magazin</p>
              <div className="space-y-2">
                <Link to="/catalog" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">Catalog</Link>
                <Link to="/catalog?category=vinyl" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">Vinyl</Link>
                <Link to="/catalog?category=cd" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">CD-uri</Link>
                <Link to="/track" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">Urmărește comanda</Link>
              </div>
            </div>

            {/* Companie */}
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Companie</p>
              <div className="space-y-2">
                <Link to="/about" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">Despre noi</Link>
                <Link to="/contact" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">Contact</Link>
                <Link to="/faq" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">Întrebări frecvente</Link>
                <Link to="/returns" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">Retur (14 zile)</Link>
              </div>
            </div>

            {/* Legal & Protectie */}
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Legal</p>
              <div className="space-y-2">
                <Link to="/terms" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">Termeni și Condiții</Link>
                <Link to="/privacy" className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">Confidențialitate</Link>
                <a href="https://www.anpc.ro" target="_blank" rel="noopener noreferrer"
                  className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">ANPC</a>
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer"
                  className="block text-gray-500 hover:text-gray-300 text-sm transition-colors">SOL Europa</a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-xs">© 2026 VinylVault SRL — Toate drepturile rezervate</p>
            <div className="flex gap-4 flex-wrap justify-center">
              <Link to="/terms" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Termeni</Link>
              <Link to="/privacy" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Confidențialitate</Link>
              <Link to="/returns" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Retur</Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Contact</Link>
              <Link to="/faq" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>

      <GDPRBanner />
    </div>
  )
}