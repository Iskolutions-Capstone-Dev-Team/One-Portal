import { useState } from "react";
import OnePortalLayout from "../../../layouts/OnePortalLayout";
import PortalHero from "../components/PortalHero";
import PortalToolbar from "../components/PortalToolbar";
import SystemGrid from "../components/SystemGrid";
import { usePortalSystems } from "../hooks/usePortalSystems";


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
    const {
        availableSystems,
        isLoadingSystems,
        systemsError,
        systemsErrorStatus
    } = usePortalSystems();

    const normalizedQuery = searchQuery.toLowerCase();
    const filteredSystems = availableSystems.filter((system) =>
        system.title.toLowerCase().includes(normalizedQuery)
    );
    const emptyStateMessage = getEmptyStateMessage({
        isLoadingSystems,
        systemsError,
        searchQuery,
        hasSystems: availableSystems.length > 0,
    });

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
                            emptyMessage={emptyStateMessage}
                            searchQuery={searchQuery}
                        />
                    </div>
                </main>
            </div>
        </OnePortalLayout>
    );
}
