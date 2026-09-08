export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="nav-logo" href="#">
              <div className="logo-icon"></div>
              Trust<span>Med</span>AI
            </a>
            <p className="footer-tagline">
              Transparent AI-powered healthcare predictions, verified on blockchain.
            </p>
          </div>

          <div className="footer-columns">
            <div className="footer-col">
              <h4 className="footer-col-title">Product</h4>
              {['Features', 'How It Works', 'Disease Models', 'Hospital Matching', 'API'].map((l) => (
                <a href="#" key={l}>{l}</a>
              ))}
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Resources</h4>
              {['Documentation', 'Research Papers', 'Case Studies', 'Blog', 'Changelog'].map((l) => (
                <a href="#" key={l}>{l}</a>
              ))}
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Company</h4>
              {['About Us', 'Careers', 'Contact', 'Privacy Policy', 'Terms of Service'].map((l) => (
                <a href="#" key={l}>{l}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">© {new Date().getFullYear()} TrustMedAI. Built with Hyperledger Fabric + XAI.</div>
          <div className="footer-social">
            {[
              { label: 'GitHub', icon: '⚡' },
              { label: 'Twitter', icon: '🐦' },
              { label: 'LinkedIn', icon: '💼' },
            ].map((s) => (
              <a href="#" key={s.label} className="footer-social-link" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
