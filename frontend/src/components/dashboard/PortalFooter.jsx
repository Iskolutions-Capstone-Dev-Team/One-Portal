const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/PUPTOFFICIAL",
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
      </svg>
    ),
  },
  {
    name: "Email",
    href: "mailto:iskolutions.team@gmail.com",
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
        <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
      </svg>
    ),
  },
];

const legalLinks = [
  { label: "Privacy Policy", href: "https://www.pup.edu.ph/privacy/" },
  { label: "Terms of Service", href: "https://www.pup.edu.ph/terms/" },
];

export default function PortalFooter() {
  return (
    <footer className="portal-footer">
      <span className="portal-footer__glow portal-footer__glow--left" aria-hidden="true" />
      <span className="portal-footer__glow portal-footer__glow--right" aria-hidden="true" />

      <div className="portal-footer__shell">
        <aside className="portal-footer__info">
          <div className="portal-footer__brand">
            <img src="/assets/images/PUPlogo.png" alt="PUP Logo" className="portal-footer__logo"/>

            <div className="portal-footer__brand-copy">
              <h2 className="portal-footer__title">PUPT ONE PORTAL 2026</h2>
              <p className="portal-footer__tagline">One Portal System</p>
            </div>
          </div>

          <p className="portal-footer__description">
            Polytechnic University of the Philippines Taguig One Portal System
            (PUPT One Portal) - a centralized system that provides students,
            faculty, and staff with seamless access to various services and
            resources offered by the campus. It aims to enhance the overall user
            experience by integrating multiple services.
          </p>

          <p className="portal-footer__copyright">
            &copy; 2026 <span>Polytechnic University of the Philippines</span>
            <br />
            All rights reserved. PUPT One Portal System
          </p>
        </aside>

        <nav className="portal-footer__connect" aria-label="Stay Connected">
          <p className="portal-footer__eyebrow">Stay Connected</p>
          <h3 className="portal-footer__connect-title">
            Official PUP Taguig channels
          </h3>
          <p className="portal-footer__connect-copy">
            Follow us for updates
          </p>

          <div className="portal-footer__socials">
            {socialLinks.map(({ name, href, icon }) => (
              <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="portal-footer__social-link" aria-label={name}>
                {icon}
                <span className="sr-only">{name}</span>
              </a>
            ))}
          </div>
        </nav>
      </div>

      <div className="portal-footer__bottom">
        {legalLinks.map((link, index) => (
          <div key={link.label} className="portal-footer__bottom-item">
            {index > 0 ? (
              <span className="portal-footer__dot" aria-hidden="true" />
            ) : null}

            <a href={link.href} target="_blank" rel="noopener noreferrer" className="portal-footer__legal-link">
              {link.label}
            </a>
          </div>
        ))}
      </div>
    </footer>
  );
}