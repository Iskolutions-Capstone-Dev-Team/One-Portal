import SystemCard from "./SystemCard";
import MotionWrapper from "../MotionWrapper";

export default function SystemGrid({ systems, currentPage = 1, cardsPerPage = 6, emptyMessage = "No systems found" }) {
    if (!systems.length) {
        return <p className="portal-systems__empty">{emptyMessage}</p>;
    }

    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const paginatedSystems = systems.slice(startIndex, endIndex);

    return (
        <section className="portal-systems" aria-label="Available systems">
            <div className="portal-systems__grid">
                {paginatedSystems.map((system) => (
                    <MotionWrapper key={system.id}>
                        <SystemCard system={system} />
                    </MotionWrapper>
                ))}
            </div>
        </section>
    );
}