import { Routes, Route, useLocation } from "react-router-dom"
import { useEffect } from "react"
import Layout from "./components/layout/Layout"
import HomePage from "./pages/HomePage"
import CatalogPage from "./pages/CatalogPage"
import ProductPage from "./pages/ProductPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import AuthPage from "./pages/AuthPage"
import AccountPage from "./pages/AccountPage"
import AdminPage from "./pages/AdminPage"
import ContactPage from "./pages/ContactPage"
import AboutPage from "./pages/AboutPage"
import FAQPage from "./pages/FAQPage"
import TrackOrderPage from "./pages/TrackOrderPage"
import TermsPage from "./pages/TermsPage"
import PrivacyPage from "./pages/PrivacyPage"
import ReturnsPage from "./pages/ReturnsPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/track" element={<TrackOrderPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="*" element={
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
            <p className="text-5xl">🎵</p>
            <p className="text-2xl font-black text-white">Pagina nu a fost găsită</p>
            <p className="text-gray-500 text-sm">Discul pe care îl cauți nu există în colecția noastră.</p>
            <a href="/" className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Înapoi acasă
            </a>
          </div>
        } />
      </Routes>
    </Layout>
  )
}

export default App