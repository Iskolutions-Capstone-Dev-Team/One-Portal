import { useEffect, useState } from "react";
import OnePortalLayout from "../../../layouts/OnePortalLayout";
import PortalHero from "../components/PortalHero";
import PortalToolbar from "../components/PortalToolbar";
import SystemGrid from "../components/SystemGrid";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../../components/ui/Pagination";
import { clearSessionState, navigateToLandingPage } from "../../../services/auth";
import { getUserAccessSystems } from "../../../services/userAccess";

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
            <div className="relative min-h-screen w-full !bg-slate-100 dark:!bg-[#080808] border-none shadow-none">
                <PortalHero />
                <main className="relative z-10 px-4 md:px-8 py-12 md:py-20">
                    <div className="mx-auto max-w-7xl">
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

                        <Pagination className="mt-8 md:mt-12">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        href="#" 
                                        onClick={(e) => { 
                                            e.preventDefault(); 
                                            setCurrentPage(Math.max(1, currentPage - 1)); 
                                        }}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    const isActive = currentPage === page;
                                    return (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                href="#"
                                                isActive={isActive}
                                                onClick={(e) => { 
                                                    e.preventDefault(); 
                                                    setCurrentPage(page); 
                                                }}
                                                className={isActive 
                                                    ? "bg-[#6b1115] text-yellow-400 hover:bg-yellow-400 hover:text-[#4f0d17] border-[#6b1115]/70" 
                                                    : "hover:border-border hover:border!"
                                                }
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}
                                <PaginationItem>
                                    <PaginationNext 
                                        href="#" 
                                        onClick={(e) => { 
                                            e.preventDefault(); 
                                            setCurrentPage(Math.min(totalPages, currentPage + 1)); 
                                        }}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </main>
            </div>
        </OnePortalLayout>
    );
}
