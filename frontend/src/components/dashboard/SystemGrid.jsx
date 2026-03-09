import { systems } from "../../data/system";
import SystemCard from "./SystemCard";
import MotionWrapper from "../MotionWrapper";

export default function SystemGrid({ activeCategory, searchQuery, currentPage = 1, cardsPerPage = 6 }) {
  const filteredSystems = systems.filter((system) => {
    const matchesCategory =
      activeCategory.toLowerCase() === "all" || 
      system.category.toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch = system.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (!filteredSystems.length) {
    return <p className="text-center m-30 opacity-60">No systems found</p>;
  }

  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const paginatedSystems = filteredSystems.slice(startIndex, endIndex);

  return (
    <div className="grid gap-x-12 gap-y-16 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {paginatedSystems.map((system) => (
        <MotionWrapper keyId={system.id}>
          <SystemCard key={system.id} system={system} />
        </MotionWrapper>
      ))}
    </div>
  );
}