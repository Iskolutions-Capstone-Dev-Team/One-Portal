import { useEffect, useState } from "react";
import OnePortalLayout from "../layouts/OnePortalLayout";
import PortalHero from "../components/dashboard/PortalHero";
import PortalToolbar from "../components/dashboard/PortalToolbar";
import SystemGrid from "../components/dashboard/SystemGrid";
import Pagination from "../components/Pagination";
import { systems } from "../data/system";

export default function OnePortalHome() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const CARDS_PER_PAGE = 6;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const normalizedQuery = searchQuery.toLowerCase();
    const filteredSystems = systems.filter((system) =>
        system.title.toLowerCase().includes(normalizedQuery)
    );

    const totalPages = Math.max(1, Math.ceil(filteredSystems.length / CARDS_PER_PAGE));

    return (
        <OnePortalLayout>
            <PortalHero />
            <main className="p-10 pt-24">
                <PortalToolbar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                <SystemGrid
                    systems={filteredSystems}
                    currentPage={currentPage}
                    cardsPerPage={CARDS_PER_PAGE}
                />

                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </main>
        </OnePortalLayout>
    );
}
