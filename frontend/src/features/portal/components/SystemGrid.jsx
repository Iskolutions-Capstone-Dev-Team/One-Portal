import SystemCard from "./SystemCard";
import MotionWrapper from "../../../components/ui/MotionWrapper";

export default function SystemGrid({ systems, currentPage = 1, cardsPerPage = 6, emptyMessage = "No systems found" }) {
    if (!systems.length) {
        return (
            <div className="flex items-center justify-center min-h-[300px] p-8 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium text-center">{emptyMessage}</p>
            </div>
        );
    }

    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const paginatedSystems = systems.slice(startIndex, endIndex);

    return (
        <section id="portal-systems" className="w-full flex justify-center" aria-label="Available systems">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 md:gap-y-8 gap-x-4 max-w-5xl w-full mx-auto">
                {paginatedSystems.map((system) => (
                    <MotionWrapper key={system.id}>
                        <SystemCard system={system} />
                    </MotionWrapper>
                ))}
            </div>
        </section>
    );
}
