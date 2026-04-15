import { useEffect, useState } from "react";
import PortalNavbar from "../components/dashboard/PortalNavbar";
import PortalFooter from "../components/dashboard/PortalFooter";
import FloatingActionMenu from "../components/FloatingActionMenu";
import { usePortalTheme } from "../context/PortalThemeContext";
import { clearSessionRefreshTimestamp, getSessionRefreshDelay, navigateToLoginPage, refreshSession } from "../services/auth";

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const SKELETON_CARDS = Array.from({ length: 6 });
const SKELETON_PAGES = Array.from({ length: 4 });

function PortalLayoutSkeleton() {
    return (
        <div className="portal-home portal-home--loading" aria-busy="true" aria-live="polite">
            <span className="sr-only">Checking your session</span>

            <header className="portal-header portal-loading__header" aria-hidden="true">
                <span className="portal-header__glow portal-header__glow--left" />
                <span className="portal-header__glow portal-header__glow--right" />

                <div className="portal-home__shell">
                    <div className="portal-header__inner">
                        <div className="portal-header__brand">
                            <span className="portal-loading__logo portal-loading__block" />

                            <div className="portal-header__text portal-loading__stack portal-loading__stack--brand">
                                <span className="portal-loading__line portal-loading__line--brand portal-loading__block" />
                                <span className="portal-loading__line portal-loading__line--subbrand portal-loading__block" />
                            </div>
                        </div>

                        <div className="portal-header__actions">
                            <span className="portal-loading__header-button portal-loading__block" />
                            <span className="portal-loading__header-button portal-loading__block" />
                        </div>
                    </div>
                </div>
            </header>

            <section className="header portal-loading__hero" aria-hidden="true">
                <div className="header-background">
                    <img src="/assets/images/pup_bg.png" alt="" aria-hidden="true" className="header-bg-img" />
                    <div className="header-backdrop" aria-hidden="true" />

                    <div className="header-content">
                        <div className="header-content__shell portal-loading__hero-shell">
                            <div className="header-logos">
                                <span className="portal-loading__hero-logo portal-loading__block" />
                            </div>

                            <div className="portal-loading__hero-copy">
                                <span className="portal-loading__hero-title portal-loading__block" />
                                <span className="portal-loading__hero-subtitle portal-loading__block" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="portal-home__main portal-home__main--loading">
                <div className="portal-home__shell portal-loading">
                    <section className="portal-toolbar portal-loading__toolbar" aria-hidden="true">
                        <div className="portal-toolbar__copy portal-loading__stack portal-loading__stack--wide">
                            <span className="portal-loading__line portal-loading__line--toolbar-title portal-loading__block" />
                            <span className="portal-loading__line portal-loading__line--toolbar-copy portal-loading__block" />
                            <span className="portal-loading__line portal-loading__line--toolbar-copy-short portal-loading__block" />
                        </div>

                        <div className="portal-toolbar__search">
                            <span className="portal-loading__search portal-loading__block" />
                        </div>
                    </section>

                    <section className="portal-systems portal-loading__grid" aria-hidden="true">
                        {SKELETON_CARDS.map((_, index) => (
                            <article key={index} className="system-card portal-loading__card">
                                <figure className="system-card-media">
                                    <div className="portal-loading__card-media portal-loading__block" />
                                </figure>

                                <div className="system-card__body portal-loading__card-body">
                                    <span className="portal-loading__line portal-loading__line--card-title portal-loading__block" />
                                    <span className="portal-loading__line portal-loading__line--card-copy portal-loading__block" />
                                    <span className="portal-loading__line portal-loading__line--card-copy portal-loading__line--card-copy-wide portal-loading__block" />
                                    <span className="portal-loading__line portal-loading__line--card-copy-short portal-loading__block" />
                                    <span className="portal-loading__button portal-loading__block" />
                                </div>
                            </article>
                        ))}
                    </section>

                    <div className="portal-pagination portal-loading__pagination" aria-hidden="true">
                        {SKELETON_PAGES.map((_, index) => (
                            <span
                                key={index}
                                className={`portal-loading__page portal-loading__block ${index === 0 ? "is-active" : ""}`}
                            />
                        ))}
                    </div>
                </div>
            </main>

            <div className="portal-loading__floating" aria-hidden="true">
                <span className="portal-loading__floating-badge portal-loading__block" />
                <span className="portal-loading__floating-button portal-loading__block" />
            </div>
        </div>
    );
}

export default function OnePortalLayout({ children }) {
    const { theme } = usePortalTheme();
    const [isSessionReady, setIsSessionReady] = useState(() => getSessionRefreshDelay(REFRESH_INTERVAL_MS) > 0);

    useEffect(() => {
        let isMounted = true;
        let intervalId;
        let timeoutId;

        const initialDelay = getSessionRefreshDelay(REFRESH_INTERVAL_MS);

        const syncSession = async (showLoadingState = false) => {
            if (isMounted && showLoadingState) {
                setIsSessionReady(false);
            }

            try {
                await refreshSession();
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                if (error.status === 401) {
                    clearSessionRefreshTimestamp();
                    navigateToLoginPage();
                    return;
                }

                if (showLoadingState) {
                    console.error("Failed to refresh the current session.", error);
                }
            } finally {
                if (isMounted) {
                    setIsSessionReady(true);
                }
            }
        };

        if (initialDelay > 0) {
            setIsSessionReady(true);
        }

        timeoutId = window.setTimeout(() => {
            void syncSession(initialDelay === 0);

            intervalId = window.setInterval(() => {
                void syncSession(false);
            }, REFRESH_INTERVAL_MS);
        }, initialDelay);

        return () => {
            isMounted = false;
            window.clearTimeout(timeoutId);
            window.clearInterval(intervalId);
        };
    }, []);

    if (!isSessionReady) {
        return (
            <div className="portal-layout min-h-screen font-[Poppins]" data-portal-theme={theme}>
                <PortalLayoutSkeleton />
            </div>
        );
    }

    return (
        <div className="portal-layout min-h-screen font-[Poppins]" data-portal-theme={theme}>
            <PortalNavbar />
            {children}
            <PortalFooter />
            <FloatingActionMenu />
        </div>
    );
}
