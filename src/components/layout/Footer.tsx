import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">dKaimono</div>
            <p className="footer-brand-desc">
              Indonesia&apos;s fastest and most reliable game top-up platform.
              Top up your favorite games instantly with the cheapest prices.
            </p>
          </div>
          <div>
            <div className="footer-heading">Popular Games</div>
            <Link href="/games/mobile-legends" className="footer-link">Mobile Legends</Link>
            <Link href="/games/genshin-impact" className="footer-link">Genshin Impact</Link>
            <Link href="/games/free-fire" className="footer-link">Free Fire</Link>
            <Link href="/games/pubg-mobile" className="footer-link">PUBG Mobile</Link>
            <Link href="/games/valorant" className="footer-link">Valorant</Link>
          </div>
          <div>
            <div className="footer-heading">Support</div>
            <Link href="#" className="footer-link">Help Center</Link>
            <Link href="#" className="footer-link">Track Order</Link>
            <Link href="#" className="footer-link">Contact Us</Link>
            <Link href="#" className="footer-link">FAQ</Link>
          </div>
          <div>
            <div className="footer-heading">Company</div>
            <Link href="#" className="footer-link">About Us</Link>
            <Link href="#" className="footer-link">Terms of Service</Link>
            <Link href="#" className="footer-link">Privacy Policy</Link>
            <Link href="#" className="footer-link">Refund Policy</Link>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} dKaimono. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
