export default function Pagination({ totalPages, currentPage, onPageChange }) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <nav className="portal-pagination" aria-label="Systems pagination">
            {pages.map((page) => {
                const isActive = currentPage === page;

                return (
                    <button key={page} type="button" onClick={() => onPageChange(page)} className={`portal-pagination__button ${isActive ? "is-active" : ""}`} aria-current={isActive ? "page" : undefined}>
                        {page}
                    </button>
                );
            })}
        </nav>
    );
}