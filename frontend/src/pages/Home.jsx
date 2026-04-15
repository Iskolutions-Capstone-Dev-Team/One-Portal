import { useEffect, useState } from "react";
import OnePortalLayout from "../layouts/OnePortalLayout";
import PortalHero from "../components/dashboard/PortalHero";
import PortalToolbar from "../components/dashboard/PortalToolbar";
import SystemGrid from "../components/dashboard/SystemGrid";
import Pagination from "../components/Pagination";
import { clearSessionState, navigateToLandingPage } from "../services/auth";
import { getUserAccessSystems } from "../services/userAccess";

const CARDS_PER_PAGE = 6;

function getEmptyStateMessage({ isLoadingSystems, systemsError, searchQuery, hasSystems }) {
    if (isLoadingSystems) {
        return "Loading your available systems...";
    }

    if (systemsError) {
        return "We couldn't load your systems right now.";
    }

    if (searchQuery) {
        return `No systems found for "${searchQuery}".`;
    }

    if (!hasSystems) {
        return "No systems are available for your account yet.";
    }

    return "No systems found.";
}

export default function OnePortalHome() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [availableSystems, setAvailableSystems] = useState([]);
    const [isLoadingSystems, setIsLoadingSystems] = useState(true);
    const [systemsError, setSystemsError] = useState("");
    const [systemsErrorStatus, setSystemsErrorStatus] = useState(null);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    useEffect(() => {
        let isMounted = true;

        const loadSystems = async () => {
            setIsLoadingSystems(true);

            try {
                const systems = await getUserAccessSystems();

                if (!isMounted) {
                    return;
                }

                setAvailableSystems(systems);
                setSystemsError("");
                setSystemsErrorStatus(null);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setAvailableSystems([]);
                setSystemsError(error.message);
                setSystemsErrorStatus(error.status ?? null);
            } finally {
                if (isMounted) {
                    setIsLoadingSystems(false);
                }
            }
        };

        void loadSystems();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (systemsErrorStatus !== 401) {
            return;
        }

        clearSessionState();
        navigateToLandingPage();
    }, [systemsErrorStatus]);

    const normalizedQuery = searchQuery.toLowerCase();
    const filteredSystems = availableSystems.filter((system) =>
        system.title.toLowerCase().includes(normalizedQuery)
    );
    const totalPages = Math.max(1, Math.ceil(filteredSystems.length / CARDS_PER_PAGE));
    const emptyStateMessage = getEmptyStateMessage({
        isLoadingSystems,
        systemsError,
        searchQuery,
        hasSystems: availableSystems.length > 0,
    });

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    if (systemsErrorStatus === 401) {
        return null;
    }

    return (
        <OnePortalLayout>
            <div className="portal-home">
                <PortalHero />
                <main className="portal-home__main">
                    <div className="portal-home__shell">
                        <PortalToolbar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            isSearchDisabled={isLoadingSystems || Boolean(systemsError)}
                        />

                        <SystemGrid
                            systems={filteredSystems}
                            currentPage={currentPage}
                            cardsPerPage={CARDS_PER_PAGE}
                            emptyMessage={emptyStateMessage}
                        />

                        <Pagination
                            totalPages={totalPages}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </main>
            </div>
        </OnePortalLayout>
    );
}
