import { FacebookIcon, EmailIcon } from "./portalIcons";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61590127270893",
    icon: <FacebookIcon />,
  },
  {
    name: "Email",
    href: "mailto:iskolutions.team@gmail.com",
    icon: <EmailIcon />,
  },
];

const legalLinks = [
  { label: "Privacy Policy", href: "https://www.pup.edu.ph/privacy/" },
  { label: "Terms of Service", href: "https://www.pup.edu.ph/terms/" },
];

export default function PortalFooter() {
  return (
    <footer id="portal-footer" className="portal-footer">
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
            PUPT One Portal is a centralized platform that unifies campus
            services and resources into a single access point, providing a more
            accessible, connected, and convenient experience for the university
            community and its users.
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