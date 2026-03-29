import { useEffect, useState } from "react";
import "../styles/ContactUs.css";

const PANEL_TRANSITION_DURATION_MS = 220;
const INITIAL_FORM = {
  email: "",
  message: "",
};

function getPanelTransitionDuration() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return PANEL_TRANSITION_DURATION_MS;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : PANEL_TRANSITION_DURATION_MS;
}

function ContactIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="portal-contact__button-icon" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function validateForm(form) {
  const nextErrors = {};
  const trimmedEmail = form.email.trim();
  const trimmedMessage = form.message.trim();

  if (!trimmedEmail) {
    nextErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (!trimmedMessage) {
    nextErrors.message = "Message is required.";
  }

  return nextErrors;
}

export default function ContactUs() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPanelMounted, setIsPanelMounted] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [errorAlert, setErrorAlert] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsPanelMounted(true);
      return undefined;
    }

    if (!isPanelMounted) {
      return undefined;
    }

    const closeTimeoutId = window.setTimeout(() => {
      setIsPanelMounted(false);
    }, getPanelTransitionDuration());

    return () => {
      window.clearTimeout(closeTimeoutId);
    };
  }, [isOpen, isPanelMounted]);

  useEffect(() => {
    if (isOpen) {
      return undefined;
    }

    setErrors({});
    setErrorAlert("");
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[name];

      if (Object.keys(nextErrors).length === 0) {
        setErrorAlert("");
      }

      return nextErrors;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validateForm(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setErrorAlert("Please fix the highlighted fields before submitting.");
      return;
    }

    setForm(INITIAL_FORM);
    setErrors({});
    setErrorAlert("");
    setIsOpen(false);
  };

  return (
    <div className="portal-contact">
      {isPanelMounted ? (
        <section className={`portal-contact__panel custom-scrollbar ${isOpen ? "is-open" : "is-closing"}`} aria-label="Contact us form">
          <div className="portal-contact__panel-head">
            <p className="portal-contact__eyebrow">Support</p>
            <h2 className="portal-contact__title">Contact Us</h2>
            <p className="portal-contact__subtitle">Send us your email and message.</p>
          </div>

          <form className="portal-contact__form" onSubmit={handleSubmit} noValidate>
            {errorAlert ? (
              <div className="profile-alert profile-alert--error portal-contact__alert" role="alert">
                <span className="profile-alert__icon" aria-hidden="true">
                  <AlertIcon />
                </span>
                <p className="profile-alert__message">{errorAlert}</p>
              </div>
            ) : null}

            <div className="portal-contact__field">
              <label className="portal-contact__label" htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`profile-form__input ${errors.email ? "is-invalid" : ""}`}
                placeholder="Enter your email"
                aria-invalid={Boolean(errors.email)}
              />
              <p className={`profile-form__helper ${errors.email ? "is-error" : ""}`}>
                {errors.email ?? "We will use this email to reply to you."}
              </p>
            </div>

            <div className="portal-contact__field">
              <label className="portal-contact__label" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                className={`profile-form__input portal-contact__textarea ${errors.message ? "is-invalid" : ""}`}
                placeholder="Write your message"
                aria-invalid={Boolean(errors.message)}
                rows="5"
              />
              <p className={`profile-form__helper ${errors.message ? "is-error" : ""}`}>
                {errors.message ?? "Tell us how we can help."}
              </p>
            </div>

            <button type="submit" className="portal-contact__submit">
              Submit
            </button>
          </form>
        </section>
      ) : null}

      <button type="button" className="portal-contact__button" aria-expanded={isOpen} aria-label={isOpen ? "Close contact form" : "Open contact form"} onClick={() => setIsOpen((currentValue) => !currentValue)}>
        <ContactIcon />
      </button>
    </div>
  );
}
