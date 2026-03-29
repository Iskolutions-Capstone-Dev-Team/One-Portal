import { useEffect, useState } from "react";
import ErrorAlert from "./ErrorAlert";
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="portal-contact__button-icon" aria-hidden="true">
      <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
      <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
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

export default function ContactUs({ isOpen, onToggle, onClose, skipCloseAnimation = false }) {
  const [isPanelMounted, setIsPanelMounted] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [errorAlert, setErrorAlert] = useState("");
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsPanelMounted(true);
      return undefined;
    }

    if (!isPanelMounted) {
      return undefined;
    }

    if (skipCloseAnimation) {
      setIsPanelMounted(false);
      return undefined;
    }

    const closeTimeoutId = window.setTimeout(() => {
      setIsPanelMounted(false);
    }, getPanelTransitionDuration());

    return () => {
      window.clearTimeout(closeTimeoutId);
    };
  }, [isOpen, isPanelMounted, skipCloseAnimation]);

  useEffect(() => {
    if (isOpen) {
      return undefined;
    }

    setErrors({});
    setErrorAlert("");
    setShowErrorAlert(false);
    return undefined;
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
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
        setShowErrorAlert(false);
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
      setShowErrorAlert(true);
      return;
    }

    setForm(INITIAL_FORM);
    setErrors({});
    setErrorAlert("");
    setShowErrorAlert(false);
    onClose?.();
  };

  return (
    <div className="portal-contact">
      {isPanelMounted ? (
        <section className={`portal-contact__panel custom-scrollbar ${isOpen ? "is-open" : "is-closing"}`} aria-label="Contact us form">
          <div className="portal-contact__panel-head">
            <p className="portal-contact__eyebrow">Support</p>
            <h2 className="portal-contact__title">Contact Us</h2>
          </div>

          <form className="portal-contact__form" onSubmit={handleSubmit} noValidate>
            {showErrorAlert && errorAlert ? (
              <ErrorAlert
                message={errorAlert}
                onClose={() => setShowErrorAlert(false)}
              />
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

            <button type="submit" className="profile-action profile-action--primary portal-contact__submit">
              Submit
            </button>
          </form>
        </section>
      ) : null}

      <button type="button" className="portal-contact__button" aria-expanded={isOpen} aria-label={isOpen ? "Close contact form" : "Open contact form"} onClick={onToggle}>
        <ContactIcon />
      </button>
    </div>
  );
}