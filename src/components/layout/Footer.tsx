import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">dKaimono</div>
            <p className="footer-brand-desc">
              Platform top-up game tercepat dan terpercaya di Indonesia.
              Top up game favoritmu instan dengan harga termurah.
            </p>
          </div>
          <div>
            <div className="footer-heading">Game Populer</div>
            <Link href="/games/mobile-legends-bang-bang" className="footer-link">Mobile Legends</Link>
            <Link href="/games/genshin-impact" className="footer-link">Genshin Impact</Link>
            <Link href="/games/free-fire" className="footer-link">Free Fire</Link>
            <Link href="/games/pubg-mobile" className="footer-link">PUBG Mobile</Link>
            <Link href="/games/valorant" className="footer-link">Valorant</Link>
          </div>
          <div>
            <div className="footer-heading">Bantuan</div>
            <Link href="#" className="footer-link">Pusat Bantuan</Link>
            <Link href="#" className="footer-link">Lacak Pesanan</Link>
            <Link href="#" className="footer-link">Hubungi Kami</Link>
            <Link href="#" className="footer-link">FAQ</Link>
          </div>
          <div>
            <div className="footer-heading">Perusahaan</div>
            <Link href="#" className="footer-link">Tentang Kami</Link>
            <Link href="#" className="footer-link">Syarat & Ketentuan</Link>
            <Link href="#" className="footer-link">Kebijakan Privasi</Link>
            <Link href="#" className="footer-link">Kebijakan Pengembalian</Link>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} dKaimono. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
