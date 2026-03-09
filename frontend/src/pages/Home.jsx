import { useEffect, useState, useMemo } from "react";
import OnePortalLayout from "../layouts/OnePortalLayout";
import PortalHero from "../components/dashboard/PortalHero";
import PortalToolbar from "../components/dashboard/PortalToolbar";
import SystemGrid from "../components/dashboard/SystemGrid";
import Pagination from "../components/Pagination";
import { systems } from "../data/system";

export default function OnePortalHome() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const CARDS_PER_PAGE = 6;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeCategory]);

    const filteredSystems = useMemo(() => {
        return systems.filter((system) => {
            const matchesCategory =
                activeCategory === "All" || system.category === activeCategory;

            const matchesSearch = system.title
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, activeCategory]);

    const totalPages = Math.max(1, Math.ceil(filteredSystems.length / CARDS_PER_PAGE));
    return (
        <OnePortalLayout>
            <PortalHero />
            <main className="p-10 pt-24">
                <PortalToolbar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                />

                <SystemGrid 
                    searchQuery={searchQuery}
                    activeCategory={activeCategory} 
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